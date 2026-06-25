import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({ targetUserId: z.string() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { targetUserId } = parsed.data;

    if (targetUserId === user.id) return apiError("Cannot request your own photos", 400);

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, status: true, profile: { select: { fullName: true, showGalleryPublic: true } } },
    });

    if (!target || target.status !== "ACTIVE") return apiError("Profile not found", 404);

    // Use a unique eventKey per requester+target pair for deduplication
    const eventKey = `photo.request:${user.id}:${targetUserId}`;

    // Check for duplicate photo request notification
    const existing = await prisma.notification.findFirst({
      where: { userId: targetUserId, eventKey },
    });
    if (existing) return apiError("Photo request already sent", 409, "PHOTO_REQUEST_EXISTS");

    // Get requester's name
    const requesterProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { fullName: true, firstName: true, lastName: true },
    });
    const requesterName = requesterProfile?.fullName ||
      [requesterProfile?.firstName, requesterProfile?.lastName].filter(Boolean).join(" ") ||
      "A member";

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        channel: "IN_APP",
        eventKey,
        subject: "Photo Request",
        body: `${requesterName} has requested access to your photo gallery.`,
        status: "DELIVERED",
        sentAt: new Date(),
      },
    });

    return apiResponse({ message: "Photo request sent successfully" }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { notificationId, action } = await req.json();
    if (!notificationId || !["APPROVE", "REJECT"].includes(action)) {
      return apiError("notificationId and action (APPROVE|REJECT) are required", 400);
    }

    // Verify the notification belongs to this user and is a photo request
    const notif = await prisma.notification.findFirst({
      where: { id: notificationId, userId: user.id, eventKey: { startsWith: "photo.request:" } },
    });
    if (!notif) return apiError("Photo request not found", 404);

    // Mark notification as read regardless of action
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    if (action === "APPROVE") {
      // Extract requesterId from eventKey: "photo.request:{requesterId}:{targetId}"
      const parts = notif.eventKey.split(":");
      const requesterId = parts[1];

      if (!requesterId) return apiError("Invalid photo request", 400);

      // Grant private gallery access to only this specific requester
      await prisma.galleryAccess.upsert({
        where: { ownerId_grantedToId: { ownerId: user.id, grantedToId: requesterId } },
        create: { ownerId: user.id, grantedToId: requesterId },
        update: {},
      });

      // Notify the requester that their request was approved
      const approverProfile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: { fullName: true, firstName: true, lastName: true },
      });
      const approverName = approverProfile?.fullName ||
        [approverProfile?.firstName, approverProfile?.lastName].filter(Boolean).join(" ") ||
        "A member";

      await prisma.notification.create({
        data: {
          userId: requesterId,
          channel: "IN_APP",
          eventKey: `photo.request.approved:${user.id}:${requesterId}`,
          subject: "Photo Request Approved",
          body: `${approverName} has approved your photo request. You can now view their gallery.`,
          status: "DELIVERED",
          sentAt: new Date(),
        },
      });

      return apiResponse({ message: "Photo request approved. You have shared your gallery privately." });
    }

    // REJECT — just mark as read, no further action
    return apiResponse({ message: "Photo request rejected." });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");
    if (!targetUserId) return apiError("targetUserId is required", 400);

    const eventKey = `photo.request:${user.id}:${targetUserId}`;
    const existing = await prisma.notification.findFirst({
      where: { userId: targetUserId, eventKey },
    });

    return apiResponse({ requested: !!existing });
  } catch (err) {
    return handleApiError(err);
  }
}
