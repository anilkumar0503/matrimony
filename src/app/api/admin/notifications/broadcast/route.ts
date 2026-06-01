import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({
  targetType: z.enum(["ALL", "ACTIVE", "PREMIUM", "VIP", "PENDING_KYC"]),
  subject: z.string().optional(),
  body: z.string().min(1),
  channel: z.enum(["IN_APP", "EMAIL", "SMS"]),
});

export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { targetType, subject, body: msgBody, channel } = parsed.data;

    let userWhere: Record<string, unknown> = {};
    switch (targetType) {
      case "ACTIVE": userWhere = { status: "ACTIVE" }; break;
      case "PREMIUM":
        userWhere = { subscriptions: { some: { status: "ACTIVE", plan: { tier: "PREMIUM" } } } }; break;
      case "VIP":
        userWhere = { subscriptions: { some: { status: "ACTIVE", plan: { tier: "VIP" } } } }; break;
      case "PENDING_KYC": userWhere = { status: "PENDING_KYC" }; break;
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    await prisma.manualNotification.create({
      data: {
        sentBy: admin.id,
        targetType,
        channel,
        subject: subject || null,
        body: msgBody,
      },
    });

    await prisma.notification.createMany({
      data: users.map((u: { id: string }) => ({
        userId: u.id,
        channel,
        eventKey: "broadcast",
        subject: subject || null,
        body: msgBody,
        status: "SENT",
        sentAt: new Date(),
      })),
    });

    return apiResponse({ message: `Broadcast queued for ${users.length} users via ${channel}` });
  } catch (err) {
    return handleApiError(err);
  }
}
