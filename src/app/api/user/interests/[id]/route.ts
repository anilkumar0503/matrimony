import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";

const schema = z.object({ action: z.enum(["ACCEPT", "DECLINE", "WITHDRAW"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { action } = parsed.data;

    const interest = await prisma.interest.findUnique({ where: { id } });
    if (!interest) return apiError("Interest not found", 404);
    if (interest.status !== "PENDING") return apiError("Interest already responded to", 400);

    if (action === "WITHDRAW" && interest.senderId !== user.id) return apiError("Unauthorized", 403);
    if ((action === "ACCEPT" || action === "DECLINE") && interest.receiverId !== user.id) return apiError("Unauthorized", 403);

    const statusMap = { ACCEPT: "ACCEPTED", DECLINE: "DECLINED", WITHDRAW: "WITHDRAWN" } as const;
    const updated = await prisma.interest.update({
      where: { id },
      data: { status: statusMap[action] },
    });

    if (action === "ACCEPT") {
      const [userAId, userBId] = [interest.senderId, interest.receiverId].sort();
      const match = await prisma.mutualMatch.create({
        data: { userAId, userBId, interestId: interest.id },
      });

      await prisma.matchTicket.create({
        data: { matchId: match.id, status: "OPEN" },
      });

      await sendNotification({
        userId: interest.senderId,
        event: NOTIFICATION_EVENTS.INTEREST_ACCEPTED,
        variables: { user_name: "" },
      });
      await sendNotification({
        userId: interest.receiverId,
        event: NOTIFICATION_EVENTS.MUTUAL_MATCH,
        variables: { user_name: "" },
      });
    } else if (action === "DECLINE") {
      await sendNotification({
        userId: interest.senderId,
        event: NOTIFICATION_EVENTS.INTEREST_DECLINED,
        variables: { user_name: "" },
      });
    }

    return apiResponse({ interest: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
