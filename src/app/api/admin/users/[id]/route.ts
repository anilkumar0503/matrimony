import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";

const actionSchema = z.object({
  action: z.enum(["APPROVE", "SUSPEND", "DELETE", "REACTIVATE", "FORCE_LOGOUT"]),
  reason: z.string().optional(),
});

const profileUpdateSchema = z.object({
  // Basic Personal Information
  fullName: z.string().optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bloodGroup: z.string().optional(),
  physicalStatus: z.string().optional(),
  complexion: z.string().optional(),
  aboutMe: z.string().optional(),
  maritalStatus: z.string().optional(),
  
  // Contact Information
  alternatePhone: z.string().optional(),
  currentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Religion & Community
  motherTongue: z.string().optional(),
  religion: z.string().optional(),
  community: z.string().optional(),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  gothram: z.string().optional(),
  languagesKnown: z.array(z.string()).optional(),
  
  // Horoscope / Astrology
  timeOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nakshatra: z.string().optional(),
  rashi: z.string().optional(),
  lagna: z.string().optional(),
  dosham: z.array(z.string()).optional(),
  nadi: z.string().optional(),
  gana: z.string().optional(),
  yoni: z.string().optional(),
  rajju: z.string().optional(),
  mahendra: z.string().optional(),
  vedha: z.string().optional(),
  dasaDetails: z.string().optional(),
  horoscopeNotes: z.string().optional(),
  
  // Education & Professional
  qualification: z.string().optional(),
  university: z.string().optional(),
  occupationType: z.string().optional(),
  employerName: z.string().optional(),
  annualIncome: z.string().optional(),
  workCity: z.string().optional(),
  workState: z.string().optional(),
  
  // Family Details
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherIncome: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  brothersCount: z.number().optional(),
  marriedBrothers: z.number().optional(),
  sistersCount: z.number().optional(),
  marriedSisters: z.number().optional(),
  familyType: z.string().optional(),
  familyStatus: z.string().optional(),
  familyValues: z.string().optional(),
  
  // Lifestyle
  diet: z.string().optional(),
  smoking: z.string().optional(),
  drinking: z.string().optional(),
  fitnessLevel: z.string().optional(),
  exerciseHabits: z.string().optional(),
  sleepSchedule: z.string().optional(),
  hasPets: z.boolean().optional(),
  petsDetails: z.string().optional(),
  
  // Personality & Values
  personalityType: z.string().optional(),
  isIntrovert: z.boolean().optional(),
  isExtrovert: z.boolean().optional(),
  isFamilyOriented: z.boolean().optional(),
  isCareerOriented: z.boolean().optional(),
  religiousBeliefs: z.string().optional(),
  futureGoals: z.string().optional(),
  lifePriorities: z.string().optional(),
  partnerExpectations: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_VIEW]);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: { include: { partnerPreferences: true } },
        kycSubmissions: { orderBy: { createdAt: "desc" } },
        images: { orderBy: { sortOrder: "asc" }, select: { id: true, status: true, isPrimary: true, category: true, originalUrl: true, sortOrder: true } },
        subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
        communityMembers: { include: { community: true } },
        consentRecords: { orderBy: { createdAt: "desc" }, take: 20 },
        sessions: { where: { revokedAt: null }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) return apiError("User not found", 404);
    return apiResponse({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.USERS_APPROVE]);
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { action, reason } = parsed.data;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("User not found", 404);

    let newStatus = user.status;
    let auditAction: "USER_APPROVED" | "USER_SUSPENDED" | "USER_DELETED" | "FORCE_LOGOUT";
    let notifEvent: string | null = null;

    switch (action) {
      case "APPROVE":
        newStatus = "ACTIVE";
        auditAction = "USER_APPROVED";
        notifEvent = NOTIFICATION_EVENTS.PROFILE_APPROVED;
        break;
      case "SUSPEND":
        newStatus = "SUSPENDED";
        auditAction = "USER_SUSPENDED";
        notifEvent = NOTIFICATION_EVENTS.PROFILE_REJECTED;
        await prisma.session.updateMany({ where: { userId: id }, data: { revokedAt: new Date() } });
        break;
      case "DELETE":
        newStatus = "DELETED";
        auditAction = "USER_DELETED";
        await prisma.session.updateMany({ where: { userId: id }, data: { revokedAt: new Date() } });
        break;
      case "REACTIVATE":
        newStatus = "ACTIVE";
        auditAction = "USER_APPROVED";
        break;
      case "FORCE_LOGOUT":
        auditAction = "FORCE_LOGOUT";
        await prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
        return apiResponse({ message: "User force-logged out from all sessions." });
    }

    await prisma.user.update({ where: { id }, data: { status: newStatus } });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: auditAction!,
        targetType: "User",
        targetId: id,
        details: { reason, previousStatus: user.status, newStatus },
      },
    });

    if (notifEvent) {
      await sendNotification({
        userId: id,
        event: notifEvent as typeof NOTIFICATION_EVENTS.PROFILE_APPROVED,
        variables: { user_name: user.email, reason: reason || "" },
      });
    }

    return apiResponse({ message: `User ${action.toLowerCase()}d successfully.`, status: newStatus });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_EDIT]);
    const { id } = await params;
    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) return apiError("User not found", 404);

    // Filter out undefined values and cast to any to bypass strict type checking for enums
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    // Create profile if it doesn't exist
    if (!user.profile) {
      await prisma.userProfile.create({
        data: {
          userId: id,
          ...updateData as any,
        },
      });
    } else {
      // Update existing profile
      await prisma.userProfile.update({
        where: { userId: id },
        data: updateData as any,
      });
    }

    return apiResponse({ message: "Profile updated successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
