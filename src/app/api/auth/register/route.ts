import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { hashPassword } from "@/lib/encryption";
import { generateOTP, validateAge } from "@/lib/utils";
import { sendEmailDirect } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { setWithExpiry } from "@/lib/redis";

const schema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(15).regex(/^\+?[0-9]+$/),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth/register");
  if (limited) return limited;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, phone, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existing?.email === email) return apiError("Email already registered", 409, "EMAIL_EXISTS");
    if (existing?.phone === phone) return apiError("Phone already registered", 409, "PHONE_EXISTS");

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        status: "PENDING_VERIFICATION",
      },
    });

    const otp = generateOTP();
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        purpose: "REGISTRATION",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await setWithExpiry(`otp:resend:${email}`, "1", 60);

    await sendEmailDirect({
      to: email,
      subject: "Verify your email — Jasmine Matrimony",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#7B1D1D">Verify Your Email</h2>
          <p>Your OTP for email verification is:</p>
          <div style="font-size:2rem;font-weight:bold;letter-spacing:0.5rem;color:#f78222;padding:1rem 0">${otp}</div>
          <p style="color:#666">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `,
    });

    return apiResponse({ message: "OTP sent to email. Please verify within 10 minutes." }, 201);
  } catch (err) {
    console.error(err);
    return apiError("Registration failed. Please try again.", 500);
  }
}
