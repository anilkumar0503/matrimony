import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { comparePassword, generateSecureToken } from "@/lib/encryption";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth/login");
  if (limited) return limited;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, password, rememberMe } = parsed.data;
    const ip = getClientIp(req);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) return apiError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    if (!user.emailVerified) return apiError("Please verify your email first", 403, "EMAIL_NOT_VERIFIED");
    if (user.status === "SUSPENDED") return apiError("Your account has been suspended. Contact support.", 403, "SUSPENDED");
    if (user.status === "DELETED") return apiError("This account has been deleted.", 410, "DELETED");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return apiError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    const refreshToken = generateSecureToken();
    const sessionTtl = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
        expiresAt: new Date(Date.now() + sessionTtl),
      },
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, type: "user" });
    const rToken = signRefreshToken({ sub: user.id, sessionId: session.id, type: "user" });

    return apiResponse({
      accessToken,
      refreshToken: rToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        gender: user.gender,
        fullName: user.profile?.fullName || user.email.split('@')[0],
      },
    });
  } catch (err) {
    console.error(err);
    return apiError("Login failed. Please try again.", 500);
  }
}
