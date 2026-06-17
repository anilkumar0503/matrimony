import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const matches = await prisma.mutualMatch.findMany({
      where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
      include: {
        userA: {
          select: {
            id: true, dateOfBirth: true,
            profile: { select: { fullName: true, city: true, state: true } },
            images: { where: { status: "APPROVED" }, select: { originalUrl: true, watermarkedUrl: true, isPrimary: true }, take: 3 },
          },
        },
        userB: {
          select: {
            id: true, dateOfBirth: true,
            profile: { select: { fullName: true, city: true, state: true } },
            images: { where: { status: "APPROVED" }, select: { originalUrl: true, watermarkedUrl: true, isPrimary: true }, take: 3 },
          },
        },
        ticket: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse({ matches, total: matches.length });
  } catch (err) {
    return handleApiError(err);
  }
}
