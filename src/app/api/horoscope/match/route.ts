import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { calculateHoroscopeMatch, calculateBatchMatches, sortMatchesByScore, filterByMatchScore } from "@/lib/horoscope/match";
import { HoroscopeData } from "@/lib/horoscope/types";

// Sanskrit to English rashi mapping
const RASHI_MAP: Record<string, string> = {
  "Mesha": "Aries",
  "Vrishabha": "Taurus",
  "Mithuna": "Gemini",
  "Karka": "Cancer",
  "Simha": "Leo",
  "Kanya": "Virgo",
  "Tula": "Libra",
  "Vrishchika": "Scorpio",
  "Dhanu": "Sagittarius",
  "Makara": "Capricorn",
  "Kumbha": "Aquarius",
  "Meena": "Pisces",
};

const GANA_MAP: Record<string, string> = {
  "Deva": "Dev",
  "Deva Gana": "Dev",
  "Manushya": "Manush",
  "Manushya Gana": "Manush",
  "Rakshasa": "Rakshas",
  "Rakshasa Gana": "Rakshas",
};

function normalizeRashi(rashi: string | null | undefined): string | undefined {
  if (!rashi) return undefined;
  return RASHI_MAP[rashi] || rashi;
}

function normalizeLagna(lagna: string | null | undefined): string | undefined {
  if (!lagna) return undefined;
  return RASHI_MAP[lagna] || lagna;
}

function normalizeGana(gana: string | null | undefined): string | undefined {
  if (!gana) return undefined;
  return GANA_MAP[gana] || gana;
}

const matchRequestSchema = z.object({
  minScore: z.number().min(0).max(36).optional().default(18),
  sortByScore: z.boolean().optional().default(true),
  limit: z.number().min(1).max(100).optional().default(20),
  gender: z.enum(["MALE", "FEMALE", "ALL"]).optional().default("ALL"),
  targetProfileId: z.string().optional(),
  filters: z.object({
    nakshatra: z.string().optional(),
    rashi: z.string().optional(),
    nadi: z.string().optional(),
    gana: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = matchRequestSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { minScore, sortByScore, limit, gender, targetProfileId, filters } = parsed.data;

    // Get user's profile with horoscope data
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!userProfile) return apiError("User profile not found", 404);

    // Normalize user horoscope data from UserProfile
    const normalizedUserHoroscope: HoroscopeData = {
      nakshatra: userProfile.nakshatra || "",
      rashi: normalizeRashi(userProfile.rashi) || "",
      lagna: normalizeLagna(userProfile.lagna) || "",
      nadi: userProfile.nadi || "",
      gana: normalizeGana(userProfile.gana) || "",
      dosham: userProfile.dosham as string[] || [],
    };

    // If targetProfileId is provided, match with that specific profile
    if (targetProfileId) {
      const targetProfile = await prisma.userProfile.findUnique({
        where: { userId: targetProfileId },
        include: { user: true },
      });

      if (!targetProfile) return apiError("Target profile not found", 404);

      // Normalize target horoscope data from UserProfile
      const normalizedTargetHoroscope: HoroscopeData = {
        nakshatra: targetProfile.nakshatra || "",
        rashi: normalizeRashi(targetProfile.rashi) || "",
        lagna: normalizeLagna(targetProfile.lagna) || "",
        nadi: targetProfile.nadi || "",
        gana: normalizeGana(targetProfile.gana) || "",
        dosham: targetProfile.dosham as string[] || [],
      };

      const match = calculateHoroscopeMatch(normalizedUserHoroscope, normalizedTargetHoroscope);

      return apiResponse({
        matches: [{
          profile: {
            userId: targetProfile.userId,
            id: targetProfile.user.id,
            gender: targetProfile.user.gender,
            dateOfBirth: targetProfile.user.dateOfBirth,
            status: targetProfile.user.status,
            fullName: targetProfile.fullName,
            city: targetProfile.city,
            state: targetProfile.state,
            religion: targetProfile.religion,
            caste: targetProfile.caste,
            height: targetProfile.height,
            profileCompletionPct: targetProfile.profileCompletionPct,
            ...normalizedTargetHoroscope,
          },
          match,
        }],
        total: 1,
        userHoroscope: normalizedUserHoroscope,
      });
    }

    // Original search logic for finding multiple matches

    // Build query filters - use gender parameter or default to opposite gender
    const targetGender = gender === "ALL" 
      ? (userProfile.user.gender === "MALE" ? "FEMALE" : "MALE")
      : gender;
    
    const where: any = {
      user: {
        id: { not: user.id },
        status: "ACTIVE",
        gender: targetGender,
      },
    };

    if (filters?.nakshatra) {
      where.nakshatra = filters.nakshatra;
    }
    if (filters?.rashi) {
      where.rashi = filters.rashi;
    }
    if (filters?.nadi) {
      where.nadi = filters.nadi;
    }
    if (filters?.gana) {
      where.gana = filters.gana;
    }

    // Fetch potential matches with full profile data
    const profiles = await prisma.userProfile.findMany({
      where,
      select: {
        userId: true,
        nakshatra: true,
        rashi: true,
        lagna: true,
        nadi: true,
        gana: true,
        dosham: true,
        community: true,
        fullName: true,
        city: true,
        state: true,
        religion: true,
        caste: true,
        height: true,
        profileCompletionPct: true,
        user: {
          select: {
            id: true,
            gender: true,
            dateOfBirth: true,
            status: true,
          },
        },
      },
      take: limit * 2, // Fetch more to filter by score
    });

    console.log(`[Horoscope Match] User: ${user.id}, Gender: ${userProfile.user.gender}, Target: ${targetGender}`);
    console.log(`[Horoscope Match] User horoscope:`, normalizedUserHoroscope);
    console.log(`[Horoscope Match] Found ${profiles.length} profiles with target gender`);
    console.log(`[Horoscope Match] Sample profiles:`, profiles.slice(0, 3).map(p => ({ id: p.userId, nakshatra: p.nakshatra, rashi: p.rashi })));

    // Calculate match scores
    const matches = profiles.map((profile) => {
      const profileHoroscope: HoroscopeData = {
        nakshatra: profile.nakshatra || undefined,
        rashi: normalizeRashi(profile.rashi),
        lagna: normalizeLagna(profile.lagna),
        nadi: profile.nadi || undefined,
        gana: normalizeGana(profile.gana),
        dosham: profile.dosham as string[] || undefined,
        community: profile.community || undefined,
      };

      const match = calculateHoroscopeMatch(normalizedUserHoroscope, profileHoroscope);
      console.log(`[Horoscope Match] Profile ${profile.userId}: score=${match.finalScore}, category=${match.category}, horoscope=`, profileHoroscope);

      return {
        profile: {
          userId: profile.userId,
          id: profile.user.id,
          gender: profile.user.gender,
          dateOfBirth: profile.user.dateOfBirth,
          status: profile.user.status,
          fullName: profile.fullName,
          city: profile.city,
          state: profile.state,
          religion: profile.religion,
          caste: profile.caste,
          height: profile.height,
          profileCompletionPct: profile.profileCompletionPct,
          ...profileHoroscope,
        },
        match,
      };
    });

    // Filter by minimum score
    const filteredMatches = filterByMatchScore(matches, minScore);

    // Sort by score if requested
    const sortedMatches = sortByScore ? sortMatchesByScore(filteredMatches) : filteredMatches;

    // Limit results
    const finalMatches = sortedMatches.slice(0, limit);

    return apiResponse({
      matches: finalMatches,
      total: finalMatches.length,
      userHoroscope: normalizedUserHoroscope,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
