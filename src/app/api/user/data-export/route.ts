import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, handleApiError } from "@/lib/auth";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        images: { select: { category: true, status: true, createdAt: true } },
        kycSubmissions: { select: { documentType: true, status: true, createdAt: true } },
        subscriptions: { include: { plan: { select: { name: true, tier: true } } } },
        interests: { select: { status: true, createdAt: true } },
        receivedInterests: { select: { status: true, createdAt: true } },
        consentRecords: { select: { purpose: true, granted: true, createdAt: true } },
      },
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        id: fullUser?.id,
        email: fullUser?.email,
        phone: fullUser?.phone,
        gender: fullUser?.gender,
        dateOfBirth: fullUser?.dateOfBirth,
        status: fullUser?.status,
        createdAt: fullUser?.createdAt,
      },
      profile: fullUser?.profile,
      images: fullUser?.images,
      kycSubmissions: fullUser?.kycSubmissions,
      subscriptions: fullUser?.subscriptions,
      interests: {
        sent: fullUser?.interests.length,
        received: fullUser?.receivedInterests.length,
      },
      consents: fullUser?.consentRecords,
    };

    await prisma.dataExportRequest.create({
      data: {
        userId: user.id,
        status: "COMPLETED",
        fileUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(exportPayload, null, 2)).toString("base64")}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
    });

    await sendNotification({
      userId: user.id,
      event: NOTIFICATION_EVENTS.DATA_EXPORT_READY,
      channels: ["IN_APP", "EMAIL"],
    });

    return apiResponse({ message: "Data export prepared. You will receive an email with the download link within 24 hours." });
  } catch (err) {
    return handleApiError(err);
  }
}
