import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getProfileCompletionPct } from "@/lib/utils";

const personalSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  height: z.number().int().min(100).max(250).optional(),
  weight: z.number().int().min(30).max(200).optional(),
  complexion: z.string().optional(),
  motherTongue: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  citizenship: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  aboutMe: z.string().max(1000).optional(),
  maritalStatus: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]).optional(),
  // Family
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  siblingsCount: z.number().int().min(0).optional(),
  familyType: z.enum(["NUCLEAR", "JOINT"]).optional(),
  familyStatus: z.enum(["MIDDLE_CLASS", "UPPER_MIDDLE_CLASS", "AFFLUENT"]).optional(),
  familyValues: z.enum(["TRADITIONAL", "MODERATE", "LIBERAL"]).optional(),
  // Education
  qualification: z.string().optional(),
  university: z.string().optional(),
  occupationType: z.string().optional(),
  employerName: z.string().optional(),
  annualIncome: z.string().optional(),
  workCity: z.string().optional(),
  workState: z.string().optional(),
  // Horoscope
  timeOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nakshatra: z.string().optional(),
  rashi: z.string().optional(),
  gothram: z.string().optional(),
  dosham: z.array(z.enum(["MANGAL_DOSHAM", "NADI_DOSHAM", "CHEVVAI_DOSHAM", "NO_DOSHAM"])).optional(),
  horoscopeNotes: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { partnerPreferences: true },
    });

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        email: true, 
        phone: true, 
        gender: true, 
        dateOfBirth: true, 
        status: true,
        kycSubmissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return apiResponse({ profile, user: userData });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = personalSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const data = parsed.data;

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    const completionPct = getProfileCompletionPct(profile as unknown as Record<string, unknown>);
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { profileCompletionPct: completionPct },
    });

    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (currentUser?.status === "PENDING_PROFILE" && completionPct >= 60) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "PENDING_KYC" },
      });
    }

    return apiResponse({ profile: { ...profile, profileCompletionPct: completionPct } });
  } catch (err) {
    return handleApiError(err);
  }
}
