import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { uploadFile, STORAGE_FOLDERS } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "selfie" | "id";
    const kycId = formData.get("kycId") as string;

    if (!file || !type || !kycId) return apiError("Missing required fields", 400);

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) return apiError(`File too large. Max ${maxMb}MB.`, 400);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) return apiError("Invalid file type", 400);

    const kyc = await prisma.kYCSubmission.findUnique({
      where: { id: kycId, userId: user.id },
    });
    if (!kyc) return apiError("KYC submission not found", 404);
    if (kyc.status !== "PENDING" && kyc.status !== "REJECTED") {
      return apiError("Cannot upload for this KYC submission", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = STORAGE_FOLDERS.kyc(user.id);
    const url = await uploadFile(buffer, folder, file.name, file.type);

    const updateData = type === "selfie"
      ? { selfieUrl: url, status: "PENDING" as const }
      : { documentUrl: url };

    await prisma.kYCSubmission.update({ where: { id: kycId }, data: updateData });

    return apiResponse({ url, message: `${type === "selfie" ? "Selfie" : "ID document"} uploaded successfully.` });
  } catch (err) {
    return handleApiError(err);
  }
}
