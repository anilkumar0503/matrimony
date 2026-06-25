import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import bcrypt from "bcryptjs";
import { sendEmailDirect } from "@/lib/notifications";

const createUserSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string(),
  fullName: z.string().min(2),
  city: z.string().optional(),
  state: z.string().optional(),
  sendEmail: z.boolean().default(true),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
  fullName: z.string().min(2).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_CREATE]);
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, phone, gender, dateOfBirth, fullName, city, state, sendEmail } = parsed.data;

    // Check if email or phone already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) return apiError("User with this email or phone already exists", 409, "USER_EXISTS");

    // Default password
    const defaultPassword = "Welcome@jm";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        status: "PENDING_PROFILE",
        emailVerified: true, // Admin-created users are pre-verified
        profile: {
          create: {
            fullName,
            city,
            state,
            profileCreatedBy: "PARENT", // Admin acts as parent/creator
          },
        },
      },
      include: { profile: true },
    });

    // Send welcome email
    if (sendEmail) {
      await sendEmailDirect({
        to: email,
        subject: "Welcome to Jasmine Matrimony — Your Account is Ready",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:20px">
            <h2 style="color:#7B1D1D;margin-bottom:20px">Welcome to Jasmine Matrimony</h2>
            <p style="color:#333;line-height:1.6;margin-bottom:15px">
              Dear ${fullName},
            </p>
            <p style="color:#333;line-height:1.6;margin-bottom:15px">
              Your account has been created by our team. You can now log in and complete your profile.
            </p>
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0">
              <p style="margin:0 0 8px 0;color:#666;font-size:14px">Login Credentials:</p>
              <p style="margin:0 0 5px 0;color:#333"><strong>Email:</strong> ${email}</p>
              <p style="margin:0;color:#333"><strong>Password:</strong> ${defaultPassword}</p>
            </div>
            <p style="color:#333;line-height:1.6;margin-bottom:15px">
              Please change your password after your first login for security.
            </p>
            <p style="color:#666;font-size:12px;margin-top:30px">
              If you have any questions, please contact our support team.
            </p>
          </div>
        `,
      });
    }

    return apiResponse({ user }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_EDIT]);
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) return apiError("User ID is required", 400);

    const parsed = updateUserSchema.safeParse(updateData);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400, "VALIDATION_ERROR");

    const { email, phone, gender, dateOfBirth, fullName, city, state } = parsed.data;

    // Check if email/phone conflicts with another user
    if (email || phone) {
      const orConditions: any[] = [];
      if (email) orConditions.push({ email });
      if (phone) orConditions.push({ phone });
      
      if (orConditions.length > 0) {
        const conflict = await prisma.user.findFirst({
          where: {
            id: { not: id },
            OR: orConditions,
          },
        });
        if (conflict) return apiError("Email or phone already in use by another user", 409);
      }
    }

    // Update user and profile
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(phone && { phone }),
        ...(gender && { gender }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(fullName || city || state ? {
          profile: {
            update: {
              ...(fullName && { fullName }),
              ...(city !== undefined && { city }),
              ...(state !== undefined && { state }),
            },
          },
        } : {}),
      },
      include: { profile: true },
    });

    return apiResponse({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_DELETE]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return apiError("User ID is required", 400);

    // Soft delete - mark as DELETED
    await prisma.user.update({
      where: { id },
      data: { status: "DELETED", deactivatedAt: new Date() },
    });

    return apiResponse({ message: "User deleted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_VIEW]);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const kycStatus = searchParams.get("kycStatus");
    const subscriptionTier = searchParams.get("tier");
    const communityId = searchParams.get("communityId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (kycStatus) where.kycSubmissions = { some: { status: kycStatus } };
    if (subscriptionTier) where.subscriptions = { some: { status: "ACTIVE", plan: { tier: subscriptionTier } } };
    if (communityId) where.communityMembers = { some: { communityId, status: "APPROVED" } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: { select: { fullName: true, city: true, state: true, religion: true } },
          kycSubmissions: { orderBy: { createdAt: "desc" }, take: 1 },
          subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 },
          images: { where: { isPrimary: true }, take: 1 },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return apiResponse({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
