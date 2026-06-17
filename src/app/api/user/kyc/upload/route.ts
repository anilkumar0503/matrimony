import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { uploadPrivateFile, STORAGE_FOLDERS } from "@/lib/storage";

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
    const url = await uploadPrivateFile(buffer, folder, file.name, file.type);

    const updateData = type === "selfie"
      ? { selfieUrl: url, status: "PENDING" as const }
      : { documentUrl: url };

    await prisma.kYCSubmission.update({ where: { id: kycId }, data: updateData });

    // If selfie, also create/update ProfileImage with category KYC_SELFIE for display in profile page
    if (type === "selfie") {
      // Delete existing KYC_SELFIE category image for this user (allow replacement)
      await prisma.profileImage.deleteMany({
        where: { userId: user.id, category: "KYC_SELFIE" },
      });

      // Create new KYC profile image
      await prisma.profileImage.create({
        data: {
          userId: user.id,
          originalUrl: url,
          category: "KYC_SELFIE",
          status: "PENDING", // KYC images follow KYC submission status
          isPrimary: false,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      });
    }

    return apiResponse({ url, message: `${type === "selfie" ? "Selfie" : "ID document"} uploaded successfully.` });
  } catch (err) {
    return handleApiError(err);
  }
}
