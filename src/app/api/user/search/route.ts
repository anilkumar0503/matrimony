import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { calculateAge } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    const activeSub = user.subscriptions[0];
    const tier = activeSub?.plan?.tier || "FREE";
    const isPremiumPlus = tier === "PREMIUM" || tier === "VIP";

    const filters: Record<string, unknown> = {
      status: "ACTIVE",
      id: { not: user.id },
    };

    const profileFilters: Record<string, unknown> = {};

    // Basic filters (all registered users)
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");
    const state = searchParams.get("state");
    const religion = searchParams.get("religion");
    const caste = searchParams.get("caste");
    const education = searchParams.get("education");
    const maritalStatus = searchParams.get("maritalStatus");
    const gender = searchParams.get("gender");

    if (gender) filters.gender = gender;
    if (state) profileFilters.state = state;
    if (religion) profileFilters.religion = religion;
    if (caste) profileFilters.caste = caste;
    if (education) profileFilters.qualification = education;
    if (maritalStatus) profileFilters.maritalStatus = maritalStatus;

    if (ageMin || ageMax) {
      const now = new Date();
      if (ageMax) {
        const minBirth = new Date(now.getFullYear() - parseInt(ageMax) - 1, now.getMonth(), now.getDate());
        filters.dateOfBirth = { ...((filters.dateOfBirth as object) || {}), gte: minBirth };
      }
      if (ageMin) {
        const maxBirth = new Date(now.getFullYear() - parseInt(ageMin), now.getMonth(), now.getDate());
        filters.dateOfBirth = { ...((filters.dateOfBirth as object) || {}), lte: maxBirth };
      }
    }

    // Advanced filters (Premium/VIP only)
    if (isPremiumPlus) {
      const heightMin = searchParams.get("heightMin");
      const heightMax = searchParams.get("heightMax");
      const nakshatra = searchParams.get("nakshatra");
      const rashi = searchParams.get("rashi");
      const kycOnly = searchParams.get("kycOnly");
      const occupationType = searchParams.get("occupationType");
      const motherTongue = searchParams.get("motherTongue");

      if (heightMin) profileFilters.height = { ...((profileFilters.height as object) || {}), gte: parseInt(heightMin) };
      if (heightMax) profileFilters.height = { ...((profileFilters.height as object) || {}), lte: parseInt(heightMax) };
      if (nakshatra) profileFilters.nakshatra = nakshatra;
      if (rashi) profileFilters.rashi = rashi;
      if (occupationType) profileFilters.occupationType = occupationType;
      if (motherTongue) profileFilters.motherTongue = motherTongue;

      if (kycOnly === "true") {
        filters.kycSubmissions = { some: { status: "APPROVED" } };
      }
    }

    if (Object.keys(profileFilters).length > 0) {
      filters.profile = profileFilters;
    }

    // Exclude blocked profiles
    const blockedIds = await prisma.blockList.findMany({
      where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] },
      select: { blockerId: true, blockedId: true },
    });
    const excludeIds = blockedIds.flatMap((b) => [b.blockerId, b.blockedId]).filter((id) => id !== user.id);
    if (excludeIds.length > 0) {
      filters.id = { ...(typeof filters.id === "object" ? filters.id : {}), notIn: excludeIds };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filters,
        include: {
          profile: {
            select: {
              fullName: true,
              city: true,
              state: true,
              religion: true,
              caste: true,
              qualification: true,
              occupationType: true,
              height: true,
              annualIncome: isPremiumPlus ? true : false,
              profileCompletionPct: true,
            },
          },
          images: { where: { isPrimary: true, status: "APPROVED" }, take: 1 },
          kycSubmissions: { where: { status: "APPROVED" }, take: 1 },
          subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 },
        },
        skip,
        take: limit,
        orderBy: [
          { subscriptions: { _count: "desc" } },
          { createdAt: "desc" },
        ],
      }),
      prisma.user.count({ where: filters }),
    ]);

    // Track profile views (only for logged-in users, not self)
    // Do this async without awaiting to not slow down response
    const viewerUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profile: { select: { isAnonymousBrowse: true } } },
    });

    if (!viewerUser?.profile?.isAnonymousBrowse) {
      // Non-blocking view tracking would go to BullMQ queue
    }

    const safeUsers = users.map((u) => ({
      id: u.id,
      gender: u.gender,
      dateOfBirth: u.dateOfBirth,
      age: u.dateOfBirth ? calculateAge(u.dateOfBirth) : null,
      profile: u.profile,
      hasPrimaryPhoto: u.images.length > 0,
      primaryPhotoUrl: u.images[0]?.watermarkedUrl || u.images[0]?.originalUrl || null,
      isKycVerified: u.kycSubmissions.length > 0,
      subscriptionTier: u.subscriptions[0]?.plan?.tier || "FREE",
    }));

    return apiResponse({
      users: safeUsers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
