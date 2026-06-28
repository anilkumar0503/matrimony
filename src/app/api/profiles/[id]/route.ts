import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getSignedDownloadUrl } from "@/lib/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await requireUser(req);
    const viewerId = viewer.id;
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
            // Basic Personal
            profileCreatedBy: true, firstName: true, middleName: true, lastName: true, fullName: true,
            height: true, weight: true, bloodGroup: true, physicalStatus: true, complexion: true,
            aboutMe: true, maritalStatus: true,
            // Contact
            alternatePhone: true, currentAddress: true, permanentAddress: true,
            city: true, state: true, country: true, postalCode: true,
            // Religion & Community
            motherTongue: true, religion: true, community: true, caste: true, subCaste: true,
            gothram: true, languagesKnown: true,
            // Horoscope
            timeOfBirth: true, placeOfBirth: true, nakshatra: true, rashi: true, lagna: true,
            dosham: true, nadi: true, gana: true, yoni: true, rajju: true, mahendra: true,
            vedha: true, dasaDetails: true, horoscopeNotes: true,
            // Education & Career
            qualification: true, university: true, occupationType: true, employerName: true,
            annualIncome: true, workCity: true, workState: true,
            // Family
            fatherName: true, fatherOccupation: true, fatherIncome: true,
            motherName: true, motherOccupation: true,
            brothersCount: true, marriedBrothers: true, sistersCount: true, marriedSisters: true,
            familyType: true, familyStatus: true, familyValues: true,
            // Lifestyle
            diet: true, smoking: true, drinking: true, fitnessLevel: true, exerciseHabits: true,
            sleepSchedule: true, hasPets: true, petsDetails: true,
            // Personality & Values
            personalityType: true, isIntrovert: true, isExtrovert: true,
            isFamilyOriented: true, isCareerOriented: true, religiousBeliefs: true,
            futureGoals: true, lifePriorities: true, partnerExpectations: true,
            // Meta
            profileCompletionPct: true, showGalleryPublic: true,
          },
        },
        images: {
          where: {
            status: "APPROVED",
            category: { notIn: ["KYC_SELFIE", "KYC_DOCUMENT"] },
          },
          select: { id: true, originalUrl: true, watermarkedUrl: true, isPrimary: true, category: true },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        kycSubmissions: { where: { status: "APPROVED" }, select: { id: true }, take: 1 },
        subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 },
      },
    });

    if (!user) return apiError("Profile not found", 404);
    // Allow viewing own profile even if not active, but restrict others
    if (user.status !== "ACTIVE" && viewerId !== id) return apiError("Profile not available", 403);

    const isKycVerified = user.kycSubmissions.length > 0;
    const subscriptionTier = user.subscriptions[0]?.plan?.tier || "FREE";
    const showGallery = user.profile?.showGalleryPublic ?? true;

    // Check if viewer has been granted private gallery access
    let hasPrivateAccess = false;
    if (!showGallery && viewerId && viewerId !== id) {
      const grant = await prisma.galleryAccess.findUnique({
        where: { ownerId_grantedToId: { ownerId: id, grantedToId: viewerId } },
        select: { id: true },
      });
      hasPrivateAccess = !!grant;
    }

    // Filter: always show profile/primary photo; gallery if public OR viewer has private access
    const visibleImages = user.images.filter(
      img => img.category === "PROFILE" || img.isPrimary || showGallery || hasPrivateAccess
    );

    // Resolve keys to signed URLs
    const imagesWithUrls = await Promise.all(
      visibleImages.map(async (img) => ({
        ...img,
        signedUrl: await getSignedDownloadUrl(img.watermarkedUrl || img.originalUrl, 3600).catch(() => null),
      }))
    );

    let interestStatus: string | null = null;
    let isWishlisted = false;

    let pendingPhotoRequestNotifId: string | null = null;

    if (viewerId && viewerId !== id) {
      const [interest, wish, photoReqNotif] = await Promise.all([
        prisma.interest.findFirst({
          where: { OR: [{ senderId: viewerId, receiverId: id }, { senderId: id, receiverId: viewerId }] },
          orderBy: { createdAt: "desc" },
          select: { status: true },
        }),
        prisma.wishlist.findUnique({
          where: { userId_profileId: { userId: viewerId, profileId: id } },
          select: { id: true },
        }),
        // Check if the profile owner (id) has sent a photo request TO the viewer (viewerId)
        prisma.notification.findFirst({
          where: {
            userId: viewerId,
            eventKey: `photo.request:${id}:${viewerId}`,
            isRead: false,
          },
          select: { id: true },
        }),
      ]);
      interestStatus = interest?.status || null;
      isWishlisted = !!wish;
      pendingPhotoRequestNotifId = photoReqNotif?.id || null;

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

    const hasNoPhotos = user.images.length === 0;

    return apiResponse({
      profile: { ...user, images: imagesWithUrls, isKycVerified, subscriptionTier },
      interestStatus,
      isWishlisted,
      isGalleryHidden: !showGallery,
      hasNoPhotos,
      pendingPhotoRequestNotifId,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
