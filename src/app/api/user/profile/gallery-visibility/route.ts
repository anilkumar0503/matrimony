import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { showGalleryPublic } = await req.json();

    if (typeof showGalleryPublic !== "boolean") {
      return apiError("showGalleryPublic must be a boolean", 400);
    }

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, showGalleryPublic },
      update: { showGalleryPublic },
    });

    return apiResponse({
      showGalleryPublic,
      message: showGalleryPublic
        ? "Gallery is now visible to other members"
        : "Gallery is now hidden from other members",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
