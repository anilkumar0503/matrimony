import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { generateSecureToken } from "@/lib/encryption";
import { getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.enum(["REGISTRATION", "FORGOT_PASSWORD"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, code, purpose } = parsed.data;

    const otp = await prisma.oTP.findFirst({
      where: { email, purpose, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return apiError("Invalid or expired OTP", 400, "INVALID_OTP");
    if (otp.expiresAt < new Date()) return apiError("OTP has expired. Please request a new one.", 400, "OTP_EXPIRED");
    if (otp.attempts >= 3) return apiError("Too many incorrect attempts. Please request a new OTP.", 400, "TOO_MANY_ATTEMPTS");

    if (otp.code !== code) {
      await prisma.oTP.update({ where: { id: otp.id }, data: { attempts: otp.attempts + 1 } });
      return apiError("Incorrect OTP", 400, "WRONG_OTP");
    }

    await prisma.oTP.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return apiError("User not found", 404);

    if (purpose === "REGISTRATION") {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, status: "PENDING_PROFILE" },
      });

      const ip = getClientIp(req);
      const refreshToken = generateSecureToken();
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          ipAddress: ip,
          userAgent: req.headers.get("user-agent") || undefined,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const accessToken = signAccessToken({ sub: user.id, email: user.email, type: "user" });
      const rToken = signRefreshToken({ sub: user.id, sessionId: session.id, type: "user" });

      return apiResponse({ accessToken, refreshToken: rToken, step: "PROFILE_SETUP" });
    }

    if (purpose === "FORGOT_PASSWORD") {
      const resetToken = generateSecureToken();
      await prisma.oTP.create({
        data: {
          email,
          code: resetToken,
          purpose: "RESET_PASSWORD",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      return apiResponse({ resetToken, message: "OTP verified. You may reset your password." });
    }

    return apiError("Invalid purpose", 400);
  } catch (err) {
    console.error(err);
    return apiError("Verification failed. Please try again.", 500);
  }
}
