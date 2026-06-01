import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError, getAuthUser } from "@/lib/auth";
import { verifyRefreshToken } from "@/lib/jwt";

const schema = z.object({ refreshToken: z.string().optional(), all: z.boolean().optional() });

export async function POST(req: NextRequest) {
  try {
    const payload = await getAuthUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (parsed.success && parsed.data.all) {
      await prisma.session.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return apiResponse({ message: "Logged out from all devices." });
    }

    if (parsed.success && parsed.data.refreshToken) {
      try {
        const rPayload = verifyRefreshToken(parsed.data.refreshToken);
        await prisma.session.update({
          where: { id: rPayload.sessionId },
          data: { revokedAt: new Date() },
        });
      } catch {
        // Token already invalid, still return success
      }
    }

    return apiResponse({ message: "Logged out successfully." });
  } catch (err) {
    console.error(err);
    return apiError("Logout failed.", 500);
  }
}
