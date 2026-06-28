import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";
import { getSetting, SETTINGS_KEYS } from "@/lib/platform-settings";

const sendSchema = z.object({
  receiverId: z.string(),
  message: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "sent";
    const status = searchParams.get("status");

    if (type === "sent") {
      const where: any = { senderId: user.id };
      if (status) {
        where.status = status;
      } else {
        where.status = { not: "WITHDRAWN" };
      }
      
      const interests = await prisma.interest.findMany({
        where,
        include: {
          receiver: {
            include: { profile: { select: { fullName: true, city: true, state: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return apiResponse({ interests });
    }

    // received
    const where: any = { receiverId: user.id };
    if (status) {
      where.status = status;
    } else {
      where.status = "PENDING";
    }

    const interests = await prisma.interest.findMany({
      where,
      include: {
        sender: {
          include: { profile: { select: { fullName: true, city: true, state: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiResponse({ interests });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { receiverId, message } = parsed.data;

    if (receiverId === user.id) return apiError("You cannot send interest to yourself", 400);

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver || receiver.status !== "ACTIVE") return apiError("Profile not found", 404);

    const blocked = await prisma.blockList.findFirst({
      where: { OR: [{ blockerId: receiverId, blockedId: user.id }, { blockerId: user.id, blockedId: receiverId }] },
    });
    if (blocked) return apiError("Cannot send interest to this profile", 400);

    const existing = await prisma.interest.findUnique({
      where: { senderId_receiverId: { senderId: user.id, receiverId } },
    });
    if (existing) return apiError("Interest already sent", 409, "INTEREST_EXISTS");

    const activeSub = user.subscriptions[0];
    const plan = activeSub?.plan;
    const interestLimit = plan?.interestLimit ?? 3;

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const monthlyCount = await prisma.interest.count({
      where: { senderId: user.id, createdAt: { gte: thisMonthStart } },
    });

    if (interestLimit !== null && monthlyCount >= interestLimit) {
      return apiError(
        `Monthly interest limit of ${interestLimit} reached. Upgrade your plan to send more.`,
        429,
        "INTEREST_LIMIT_REACHED"
      );
    }

    const expiryDays = parseInt((await getSetting(SETTINGS_KEYS.INTEREST_EXPIRY_DAYS)) || "30");
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const interest = await prisma.interest.create({
      data: { senderId: user.id, receiverId, message, expiresAt },
    });

    await sendNotification({
      userId: receiverId,
      event: NOTIFICATION_EVENTS.INTEREST_RECEIVED,
      variables: { user_name: receiver.email },
    });

    return apiResponse({ interest }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
