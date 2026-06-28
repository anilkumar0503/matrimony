import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getProfileCompletionPct } from "@/lib/utils";
import { getSignedDownloadUrl } from "@/lib/storage";

const personalSchema = z.object({
  // Basic Personal Information
  profileCreatedBy: z.enum(["SELF", "PARENT", "SIBLING", "RELATIVE", "FRIEND"]).nullish(),
  firstName: z.string().nullish(),
  middleName: z.string().nullish(),
  lastName: z.string().nullish(),
  fullName: z.string().min(2).max(100).nullish(),
  height: z.number().int().min(100).max(250).nullish(),
  weight: z.number().int().min(30).max(200).nullish(),
  bloodGroup: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"]).nullish(),
  physicalStatus: z.enum(["NORMAL", "PHYSICALLY_CHALLENGED"]).nullish(),
  complexion: z.string().nullish(),
  aboutMe: z.string().max(1000).nullish(),
  maritalStatus: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]).nullish(),
  
  // Contact Information
  alternatePhone: z.string().nullish(),
  currentAddress: z.string().nullish(),
  permanentAddress: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string().nullish(),
  postalCode: z.string().nullish(),
  
  // Religion & Community
  motherTongue: z.string().nullish(),
  religion: z.string().nullish(),
  community: z.string().nullish(),
  caste: z.string().nullish(),
  subCaste: z.string().nullish(),
  gothram: z.string().nullish(),
  languagesKnown: z.array(z.string()).nullish(),
  
  // Horoscope / Astrology
  timeOfBirth: z.string().nullish(),
  placeOfBirth: z.string().nullish(),
  nakshatra: z.string().nullish(),
  rashi: z.string().nullish(),
  lagna: z.string().nullish(),
  dosham: z.union([z.string(), z.array(z.string())]).nullish(),
  nadi: z.string().nullish(),
  gana: z.string().nullish(),
  yoni: z.string().nullish(),
  rajju: z.string().nullish(),
  mahendra: z.string().nullish(),
  vedha: z.string().nullish(),
  dasaDetails: z.string().nullish(),
  horoscopeNotes: z.string().max(500).nullish(),
  
  // Education & Professional
  qualification: z.string().nullish(),
  university: z.string().nullish(),
  occupationType: z.string().nullish(),
  employerName: z.string().nullish(),
  annualIncome: z.string().nullish(),
  workCity: z.string().nullish(),
  workState: z.string().nullish(),
  
  // Family Details
  fatherName: z.string().nullish(),
  fatherOccupation: z.string().nullish(),
  fatherIncome: z.string().nullish(),
  motherName: z.string().nullish(),
  motherOccupation: z.string().nullish(),
  brothersCount: z.number().int().min(0).nullish(),
  marriedBrothers: z.number().int().min(0).nullish(),
  sistersCount: z.number().int().min(0).nullish(),
  marriedSisters: z.number().int().min(0).nullish(),
  familyType: z.enum(["NUCLEAR", "JOINT"]).nullish(),
  familyStatus: z.enum(["MIDDLE_CLASS", "UPPER_MIDDLE_CLASS", "AFFLUENT"]).nullish(),
  familyValues: z.enum(["TRADITIONAL", "MODERATE", "LIBERAL"]).nullish(),
  
  // Lifestyle
  diet: z.enum(["VEG", "NON_VEG", "EGGETARIAN"]).nullish(),
  smoking: z.enum(["NEVER", "OCCASIONALLY", "REGULARLY"]).nullish(),
  drinking: z.enum(["NEVER", "OCCASIONALLY", "REGULARLY"]).nullish(),
  fitnessLevel: z.enum(["SEDENTARY", "MODERATE", "ACTIVE"]).nullish(),
  exerciseHabits: z.string().nullish(),
  sleepSchedule: z.enum(["EARLY_BIRD", "NIGHT_OWL", "IRREGULAR"]).nullish(),
  hasPets: z.boolean().nullish(),
  petsDetails: z.string().nullish(),
  
  // Personality & Values
  personalityType: z.string().nullish(),
  isIntrovert: z.boolean().nullish(),
  isExtrovert: z.boolean().nullish(),
  isFamilyOriented: z.boolean().nullish(),
  isCareerOriented: z.boolean().nullish(),
  religiousBeliefs: z.string().nullish(),
  futureGoals: z.string().nullish(),
  lifePriorities: z.string().nullish(),
  partnerExpectations: z.string().nullish(),
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
        id: true,
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

    if (!userData) return apiError("User not found", 404);

    const latestKyc = userData.kycSubmissions[0];
    const kycStatus = latestKyc?.status || null;

    const rawImages = await prisma.profileImage.findMany({
      where: { userId: user.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      select: { id: true, originalUrl: true, watermarkedUrl: true, thumbnailUrl: true, isPrimary: true, status: true, category: true },
    });

    const images = await Promise.all(
      rawImages.map(async (img) => ({
        ...img,
        signedUrl: await getSignedDownloadUrl(img.watermarkedUrl || img.originalUrl, 3600).catch(() => null),
      }))
    );

    return apiResponse({ profile, user: userData, images, kycStatus });
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

    // Convert dosham from string to array and map to enum values
    const doshamMap: Record<string, string> = {
      "Manglik": "MANGAL_DOSHAM",
      "Mangal Dosham": "MANGAL_DOSHAM",
      "Nadi Dosha": "NADI_DOSHAM",
      "Chevvai Dosham": "CHEVVAI_DOSHAM",
      "No Dosham": "NO_DOSHAM",
      "MANGAL_DOSHAM": "MANGAL_DOSHAM",
      "NADI_DOSHAM": "NADI_DOSHAM",
      "CHEVVAI_DOSHAM": "CHEVVAI_DOSHAM",
      "NO_DOSHAM": "NO_DOSHAM",
    };

    let dosham: string[] | undefined = undefined;
    if (data.dosham) {
      const doshamArray = typeof data.dosham === 'string' ? [data.dosham] : data.dosham;
      dosham = doshamArray.map(d => doshamMap[d] || d).filter(d => ["MANGAL_DOSHAM", "NADI_DOSHAM", "CHEVVAI_DOSHAM", "NO_DOSHAM"].includes(d));
    }

    // Filter out null/undefined values to avoid Prisma type errors
    const updateData: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        updateData[key] = value;
      }
    }
    if (dosham) {
      updateData.dosham = dosham;
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...updateData },
      update: updateData,
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
