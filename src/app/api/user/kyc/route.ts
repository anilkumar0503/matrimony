import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { generateVerificationCode } from "@/lib/utils";
import { getSetting, SETTINGS_KEYS } from "@/lib/platform-settings";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const kyc = await prisma.kYCSubmission.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const modeBEnabled = (await getSetting(SETTINGS_KEYS.KYC_MODE_B_ENABLED)) === "true";
    const modeCEnabled = (await getSetting(SETTINGS_KEYS.KYC_MODE_C_ENABLED)) === "true";

    return apiResponse({ kyc, config: { modeBEnabled, modeCEnabled } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const maxAttempts = parseInt(await getSetting(SETTINGS_KEYS.KYC_MAX_ATTEMPTS) || "3");
    const existingKyc = await prisma.kYCSubmission.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (existingKyc?.attempts >= maxAttempts && existingKyc.status === "REJECTED") {
      return apiError(
        "Maximum KYC resubmission attempts reached. Your case has been escalated to the admin.",
        400,
        "MAX_ATTEMPTS_REACHED"
      );
    }

    const code = generateVerificationCode();
    const kyc = await prisma.kYCSubmission.create({
      data: {
        userId: user.id,
        verificationCode: code,
        codeGeneratedAt: new Date(),
        codeExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        attempts: existingKyc ? existingKyc.attempts + 1 : 1,
      },
    });

    return apiResponse({
      kyc: { id: kyc.id, verificationCode: code, expiresAt: kyc.codeExpiresAt },
      message: "Write this code on plain white paper and upload a selfie holding it.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
