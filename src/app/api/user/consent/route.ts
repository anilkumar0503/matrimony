import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getClientIp } from "@/lib/rate-limit";

const consentSchema = z.object({
  consents: z.array(
    z.object({
      category: z.enum(["profile_data", "horoscope_data", "kyc_data", "photo_uploads", "marketing"]),
      purpose: z.string(),
      granted: z.boolean(),
      version: z.string().default("1.0"),
    })
  ),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const consents = await prisma.consentRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const latestConsents: Record<string, (typeof consents)[0]> = {};
    for (const c of consents) {
      if (!latestConsents[c.category]) latestConsents[c.category] = c;
    }

    return apiResponse({ consents: Object.values(latestConsents), history: consents });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const ip = getClientIp(req);
    const ua = req.headers.get("user-agent") || "";

    const records = await prisma.consentRecord.createMany({
      data: parsed.data.consents.map((c) => ({
        userId: user.id,
        category: c.category,
        purpose: c.purpose,
        version: c.version,
        granted: c.granted,
        ipAddress: ip,
        userAgent: ua,
      })),
    });

    return apiResponse({ message: "Consent recorded.", count: records.count });
  } catch (err) {
    return handleApiError(err);
  }
}
