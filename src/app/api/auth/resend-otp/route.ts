import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { generateOTP } from "@/lib/utils";
import { sendEmailDirect } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { getOrNull, setWithExpiry } from "@/lib/redis";

const schema = z.object({
  email: z.string().email(),
  purpose: z.enum(["REGISTRATION", "FORGOT_PASSWORD"]),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth/otp");
  if (limited) return limited;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, purpose } = parsed.data;

    const cooldownKey = `otp:resend:${email}`;
    const onCooldown = await getOrNull(cooldownKey);
    if (onCooldown) return apiError("Please wait 60 seconds before requesting a new OTP.", 429, "OTP_COOLDOWN");

    const recent = await prisma.oTP.findMany({
      where: { email, purpose, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (recent.length >= 3) return apiError("Maximum OTP requests reached. Please try again later.", 429, "OTP_LIMIT");

    const otp = generateOTP();
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await setWithExpiry(cooldownKey, "1", 60);

    await sendEmailDirect({
      to: email,
      subject: purpose === "REGISTRATION" ? "Your verification OTP" : "Password reset OTP",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#7B1D1D">Your OTP</h2>
          <div style="font-size:2rem;font-weight:bold;letter-spacing:0.5rem;color:#f78222;padding:1rem 0">${otp}</div>
          <p style="color:#666">Expires in 10 minutes. Do not share.</p>
        </div>
      `,
    });

    return apiResponse({ message: "OTP resent successfully." });
  } catch (err) {
    console.error(err);
    return apiError("Failed to resend OTP.", 500);
  }
}
