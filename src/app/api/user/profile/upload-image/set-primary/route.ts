import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { imageId } = await req.json();
    if (!imageId) return apiError("imageId required", 400);

    const image = await prisma.profileImage.findUnique({
      where: { id: imageId, userId: user.id },
    });
    if (!image) return apiError("Image not found", 404);
    if (image.status !== "APPROVED") return apiError("Only approved images can be set as primary", 400);

    await prisma.$transaction([
      prisma.profileImage.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.profileImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    return apiResponse({ message: "Primary photo updated" });
  } catch (err) {
    return handleApiError(err);
  }
}
