import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { generateOTP } from "@/lib/utils";
import { sendEmailDirect } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth/otp");
  if (limited) return limited;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || !user.emailVerified) {
      return apiResponse({ message: "If this email is registered, an OTP has been sent." });
    }

    const otp = generateOTP();
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        purpose: "FORGOT_PASSWORD",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmailDirect({
      to: email,
      subject: "Password Reset OTP — Jasmine Matrimony",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#7B1D1D">Reset Your Password</h2>
          <p>Your password reset OTP is:</p>
          <div style="font-size:2rem;font-weight:bold;letter-spacing:0.5rem;color:#C9972C;padding:1rem 0">${otp}</div>
          <p style="color:#666">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    return apiResponse({ message: "If this email is registered, an OTP has been sent." });
  } catch (err) {
    console.error(err);
    return apiError("Request failed. Please try again.", 500);
  }
}
