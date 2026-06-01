import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getAuthUser(req).catch(() => null);
    const viewerId = payload?.sub;
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        gender: true,
        dateOfBirth: true,
        status: true,
        profile: {
          select: {
            fullName: true, city: true, state: true, religion: true, caste: true,
            height: true, motherTongue: true, maritalStatus: true, aboutMe: true,
            qualification: true, occupationType: true, annualIncome: true,
            familyType: true, familyValues: true, profileCompletionPct: true,
          },
        },
        images: {
          where: { status: "APPROVED" },
          select: { id: true, originalUrl: true, watermarkedUrl: true, isPrimary: true, category: true },
        },
        kycSubmissions: { where: { status: "APPROVED" }, select: { id: true }, take: 1 },
        subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 },
      },
    });

    if (!user) return apiError("Profile not found", 404);
    if (user.status !== "ACTIVE") return apiError("Profile not available", 403);

    const isKycVerified = user.kycSubmissions.length > 0;
    const subscriptionTier = user.subscriptions[0]?.plan?.tier || "FREE";

    let interestStatus: string | null = null;
    let isWishlisted = false;

    if (viewerId && viewerId !== id) {
      const [interest, wish] = await Promise.all([
        prisma.interest.findFirst({
          where: { OR: [{ senderId: viewerId, receiverId: id }, { senderId: id, receiverId: viewerId }] },
          orderBy: { createdAt: "desc" },
          select: { status: true },
        }),
        prisma.wishlist.findUnique({
          where: { userId_profileId: { userId: viewerId, profileId: id } },
          select: { id: true },
        }),
      ]);
      interestStatus = interest?.status || null;
      isWishlisted = !!wish;

      const existingView = await prisma.profileView.findFirst({
        where: { viewerId, viewedId: id },
      });
      if (existingView) {
        await prisma.profileView.update({
          where: { id: existingView.id },
          data: { createdAt: new Date() },
        });
      } else {
        await prisma.profileView.create({
          data: { viewerId, viewedId: id },
        });
      }
    }

    return apiResponse({ profile: { ...user, isKycVerified, subscriptionTier }, interestStatus, isWishlisted });
  } catch (err) {
    return handleApiError(err);
  }
}
