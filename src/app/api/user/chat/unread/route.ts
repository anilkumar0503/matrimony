import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    // Find all matches for this user
    const matches = await prisma.mutualMatch.findMany({
      where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
      select: { id: true },
    });

    const matchIds = matches.map((m) => m.id);

    // Get unread messages grouped by matchId
    const unreadMessages = await prisma.chatMessage.groupBy({
      by: ["matchId"],
      where: {
        matchId: { in: matchIds },
        senderId: { not: user.id },
        isRead: false,
      },
      _count: { id: true },
    });

    // Get last message per match for sorting
    const lastMessages = await prisma.chatMessage.groupBy({
      by: ["matchId"],
      where: { matchId: { in: matchIds } },
      _max: { createdAt: true },
    });

    // Build maps
    const perMatch: Record<string, number> = {};
    const lastMessageAt: Record<string, string> = {};
    let total = 0;

    for (const row of unreadMessages) {
      perMatch[row.matchId] = row._count.id;
      total += row._count.id;
    }
    for (const row of lastMessages) {
      if (row._max.createdAt) {
        lastMessageAt[row.matchId] = row._max.createdAt.toISOString();
      }
    }

    return apiResponse({ count: total, perMatch, lastMessageAt });
  } catch (err) {
    return handleApiError(err);
  }
}
