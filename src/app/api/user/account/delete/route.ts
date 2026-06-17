import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { comparePassword } from "@/lib/encryption";
import { sendEmailDirect } from "@/lib/notifications";

const schema = z.object({ password: z.string() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser) return apiError("User not found", 404);

    const valid = await comparePassword(parsed.data.password, fullUser.passwordHash);
    if (!valid) return apiError("Incorrect password", 401);

    if (fullUser.status === "DELETION_REQUESTED") {
      return apiError("Account deletion already requested", 409);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { status: "DELETION_REQUESTED", deletionRequestedAt: new Date() },
    });

    await prisma.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await sendEmailDirect({
      to: fullUser.email,
      subject: "Account Deletion Request Received — Jasmine Matrimony",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#7B1D1D">Account Deletion Request</h2>
          <p>We received your request to delete your account.</p>
          <p>Your profile has been hidden immediately. Your data will be permanently deleted within 30 days as per our data retention policy.</p>
          <p><strong>Changed your mind?</strong> You can cancel this request by logging in within 7 days.</p>
          <p style="color:#999;font-size:0.85rem">This complies with India's DPDP Act 2023 — Right to Erasure.</p>
        </div>
      `,
    });

    return apiResponse({
      message: "Account deletion requested. Your profile is now hidden. Data will be deleted within 30 days.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
