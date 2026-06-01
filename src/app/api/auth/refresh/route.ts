import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { verifyRefreshToken } from "@/lib/jwt";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { generateSecureToken } from "@/lib/encryption";

const schema = z.object({ refreshToken: z.string() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Refresh token required", 400);

    let payload;
    try {
      payload = verifyRefreshToken(parsed.data.refreshToken);
    } catch {
      return apiError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.revokedAt) return apiError("Session expired. Please login again.", 401, "SESSION_EXPIRED");
    if (session.expiresAt < new Date()) {
      await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      return apiError("Session expired. Please login again.", 401, "SESSION_EXPIRED");
    }

    const newRefreshToken = generateSecureToken();
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    const accessToken = signAccessToken({ sub: payload.sub, email: "", type: payload.type });
    const rToken = signRefreshToken({ sub: payload.sub, sessionId: session.id, type: payload.type });

    return apiResponse({ accessToken, refreshToken: rToken });
  } catch (err) {
    console.error(err);
    return apiError("Token refresh failed.", 500);
  }
}
