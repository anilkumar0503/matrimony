import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getProfileCompletionPct } from "@/lib/utils";
import { getSignedDownloadUrl } from "@/lib/storage";

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
  dosham: z.union([z.string(), z.array(z.string())]).optional(),
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

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data, dosham: dosham as any },
      update: { ...data, dosham: dosham as any },
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
