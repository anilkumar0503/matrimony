import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({ profileId: z.string() });

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const profileIds = wishlist.map((w: { profileId: string }) => w.profileId);
    const profiles = await prisma.user.findMany({
      where: { id: { in: profileIds }, status: "ACTIVE" },
      select: {
        id: true, gender: true, dateOfBirth: true,
        profile: { select: { fullName: true, city: true, state: true, religion: true, height: true, occupationType: true, profileCompletionPct: true } },
        images: { where: { status: "APPROVED" }, select: { originalUrl: true, watermarkedUrl: true, isPrimary: true } },
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const wishlistWithProfiles = wishlist.map((w) => ({
      ...w,
      profile: profileMap.get(w.profileId) || null,
    }));

    return apiResponse({ wishlist: wishlistWithProfiles });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { profileId } = parsed.data;

    if (profileId === user.id) return apiError("Cannot wishlist yourself", 400);

    const existing = await prisma.wishlist.findUnique({
      where: { userId_profileId: { userId: user.id, profileId } },
    });
    if (existing) return apiError("Profile already in wishlist", 400);

    const activeSub = user.subscriptions[0];
    const wishlistLimit = activeSub?.plan?.wishlistLimit ?? 5;

    const count = await prisma.wishlist.count({ where: { userId: user.id } });
    if (wishlistLimit !== null && count >= wishlistLimit) {
      return apiError(`Wishlist limit of ${wishlistLimit} reached. Upgrade your plan for more.`, 429, "WISHLIST_LIMIT");
    }

    const item = await prisma.wishlist.create({
      data: { userId: user.id, profileId },
    });

    return apiResponse({ item }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    if (!profileId) return apiError("profileId required", 400);

    await prisma.wishlist.deleteMany({ where: { userId: user.id, profileId } });
    return apiResponse({ message: "Removed from wishlist" });
  } catch (err) {
    return handleApiError(err);
  }
}
