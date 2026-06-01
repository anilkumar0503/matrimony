import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { hashPassword } from "@/lib/encryption";

const schema = z.object({
  email: z.string().email(),
  resetToken: z.string(),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, resetToken, newPassword } = parsed.data;

    const otp = await prisma.oTP.findFirst({
      where: { email, code: resetToken, purpose: "RESET_PASSWORD", usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.expiresAt < new Date()) {
      return apiError("Invalid or expired reset token. Please request a new OTP.", 400, "INVALID_RESET_TOKEN");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { email }, data: { passwordHash } });

    await prisma.oTP.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

    await prisma.session.updateMany({
      where: { user: { email }, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return apiResponse({ message: "Password reset successful. Please login with your new password." });
  } catch (err) {
    console.error(err);
    return apiError("Password reset failed. Please try again.", 500);
  }
}
