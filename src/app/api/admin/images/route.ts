import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";
import { getSignedDownloadUrl } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.IMAGES_VIEW]);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || "PENDING";
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { status };
    if (category) where.category = category;

    const [images, total, pendingCount] = await Promise.all([
      prisma.profileImage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.profileImage.count({ where }),
      prisma.profileImage.count({ where: { status: "PENDING" } }),
    ]);

    const imagesWithUrls = await Promise.all(
      images.map(async (img) => ({
        ...img,
        signedUrl: await getSignedDownloadUrl(img.originalUrl, 3600).catch(() => null),
      }))
    );

    return apiResponse({
      images: imagesWithUrls,
      pendingCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

const reviewSchema = z.object({
  imageId: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().max(200).optional(),
});

const bulkSchema = z.object({
  imageIds: z.array(z.string()),
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.IMAGES_APPROVE]);
    const body = await req.json();

    if (body.imageIds) {
      const parsed = bulkSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

      const { imageIds, action } = parsed.data;
      await prisma.profileImage.updateMany({
        where: { id: { in: imageIds } },
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: action === "APPROVE" ? "IMAGE_APPROVED" : "IMAGE_REJECTED",
          targetType: "ProfileImage",
          details: { imageIds, count: imageIds.length },
        },
      });

      return apiResponse({ message: `${imageIds.length} images ${action.toLowerCase()}d.` });
    }

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { imageId, action, rejectionReason } = parsed.data;

    const image = await prisma.profileImage.findUnique({
      where: { id: imageId },
      include: { user: true },
    });
    if (!image) return apiError("Image not found", 404);

    await prisma.profileImage.update({
      where: { id: imageId },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        rejectionReason,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    });

    if (action === "APPROVE") {
      await sendNotification({
        userId: image.userId,
        event: NOTIFICATION_EVENTS.IMAGE_APPROVED,
        variables: { user_name: image.user.email },
      });
    } else {
      await sendNotification({
        userId: image.userId,
        event: NOTIFICATION_EVENTS.IMAGE_REJECTED,
        variables: { user_name: image.user.email, reason: rejectionReason || "" },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: action === "APPROVE" ? "IMAGE_APPROVED" : "IMAGE_REJECTED",
        targetType: "ProfileImage",
        targetId: imageId,
        details: { reason: rejectionReason },
      },
    });

    return apiResponse({ message: `Image ${action.toLowerCase()}d.` });
  } catch (err) {
    return handleApiError(err);
  }
}
