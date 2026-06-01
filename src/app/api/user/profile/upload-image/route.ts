import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { uploadFile, STORAGE_FOLDERS } from "@/lib/storage";
import { enqueueImageProcessing } from "@/lib/queues";
import { getSettingOrDefault, SETTINGS_KEYS } from "@/lib/platform-settings";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "PRIMARY";
    const setPrimary = formData.get("setPrimary") === "true";

    if (!file) return apiError("No file provided", 400);

    const maxMbStr = await getSettingOrDefault(SETTINGS_KEYS.IMAGE_MAX_SIZE_MB, "5");
    const maxMb = parseFloat(maxMbStr);
    if (file.size > maxMb * 1024 * 1024) return apiError(`File too large. Max ${maxMb}MB.`, 400);

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return apiError("Only JPG, PNG, and WebP images are allowed", 400);

    const maxPerProfileStr = await getSettingOrDefault(SETTINGS_KEYS.IMAGE_MAX_PER_PROFILE, "10");
    const maxPerProfile = parseInt(maxPerProfileStr);
    const existingCount = await prisma.profileImage.count({ where: { userId: user.id, status: { not: "REJECTED" } } });
    if (existingCount >= maxPerProfile) return apiError(`Maximum ${maxPerProfile} images allowed per profile`, 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const isFirst = existingCount === 0;
    const imgCategory = isFirst ? "PROFILE" : "GALLERY";
    const folder = isFirst ? STORAGE_FOLDERS.profile(user.id) : STORAGE_FOLDERS.gallery(user.id);
    const url = await uploadFile(buffer, folder, file.name, file.type);

    if (setPrimary) {
      await prisma.profileImage.updateMany({ where: { userId: user.id, isPrimary: true }, data: { isPrimary: false } });
    }

    const image = await prisma.profileImage.create({
      data: {
        userId: user.id,
        originalUrl: url,
        category: imgCategory as "PROFILE" | "GALLERY",
        isPrimary: setPrimary || existingCount === 0,
        status: "PENDING",
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    await enqueueImageProcessing(image.id).catch(() => {});

    return apiResponse({ image, message: "Image uploaded. Pending admin moderation." }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");
    if (!imageId) return apiError("imageId required", 400);

    const image = await prisma.profileImage.findUnique({ where: { id: imageId, userId: user.id } });
    if (!image) return apiError("Image not found", 404);

    await prisma.profileImage.delete({ where: { id: imageId } });
    return apiResponse({ message: "Image deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
