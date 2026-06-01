import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({
  ageMin: z.number().int().min(18).max(80).optional(),
  ageMax: z.number().int().min(18).max(80).optional(),
  heightMin: z.number().int().min(100).max(250).optional(),
  heightMax: z.number().int().min(100).max(250).optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  educationPref: z.string().optional(),
  locationPref: z.string().optional(),
  incomePref: z.string().optional(),
  doshamPref: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Profile not found", 404);
    const prefs = await prisma.partnerPreference.findUnique({ where: { profileId: profile.id } });
    return apiResponse({ preferences: prefs });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return apiError("Complete your profile first", 400);

    const prefs = await prisma.partnerPreference.upsert({
      where: { profileId: profile.id },
      create: { profileId: profile.id, ...parsed.data },
      update: parsed.data,
    });

    return apiResponse({ preferences: prefs });
  } catch (err) {
    return handleApiError(err);
  }
}
