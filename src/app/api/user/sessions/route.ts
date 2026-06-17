import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const sessions = await prisma.session.findMany({
      where: { userId: user.id, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return apiResponse({
      sessions: sessions.map((s) => ({
        id: s.id,
        deviceInfo: s.deviceInfo,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        isCurrent: false,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
