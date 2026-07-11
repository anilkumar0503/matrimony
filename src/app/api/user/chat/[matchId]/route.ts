import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

const sendSchema = z.object({ content: z.string().min(1).max(2000) });

async function verifyMatchAccess(matchId: string, userId: string) {
  const match = await prisma.mutualMatch.findUnique({
    where: { id: matchId },
    select: { id: true, userAId: true, userBId: true },
  });
  if (!match) return null;
  if (match.userAId !== userId && match.userBId !== userId) return null;
  return match;
}

const PAGE_SIZE = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const user = await requireUser(req);
    const { matchId } = await params;

    const match = await verifyMatchAccess(matchId, user.id);
    if (!match) return apiError("Match not found or access denied", 404);

    const { searchParams } = new URL(req.url);
    // 'before' = oldest loaded message id → fetch older page
    // 'after'  = newest loaded message id → fetch only new messages (for polling)
    const before = searchParams.get("before");
    const after = searchParams.get("after");

    if (after) {
      // Polling path: return only messages newer than 'after' id
      const pivot = await prisma.chatMessage.findUnique({
        where: { id: after },
        select: { createdAt: true },
      });
      const newMessages = pivot
        ? await prisma.chatMessage.findMany({
            where: { matchId, createdAt: { gt: pivot.createdAt } },
            orderBy: { createdAt: "asc" },
            include: {
              sender: { select: { id: true, profile: { select: { fullName: true } } } },
            },
          })
        : [];

      // Mark newly arrived messages as read
      if (newMessages.length > 0) {
        await prisma.chatMessage.updateMany({
          where: { matchId, senderId: { not: user.id }, isRead: false },
          data: { isRead: true },
        });
      }

      return apiResponse({ messages: newMessages, hasMore: false });
    }

    let createdAtFilter = {};
    if (before) {
      const pivot = await prisma.chatMessage.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });
      if (pivot) createdAtFilter = { createdAt: { lt: pivot.createdAt } };
    }

    // Fetch newest-first so we can limit correctly, then reverse for ASC display
    const rows = await prisma.chatMessage.findMany({
      where: { matchId, ...createdAtFilter },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    const messages = rows.reverse(); // back to chronological order
    const hasMore = rows.length === PAGE_SIZE;

    // Mark unread messages (sent to current user) as read
    await prisma.chatMessage.updateMany({
      where: {
        matchId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return apiResponse({ messages, hasMore });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const user = await requireUser(req);
    const { matchId } = await params;

    const match = await verifyMatchAccess(matchId, user.id);
    if (!match) return apiError("Match not found or access denied", 404);

    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const message = await prisma.chatMessage.create({
      data: {
        matchId,
        senderId: user.id,
        content: parsed.data.content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    return apiResponse({ message }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
