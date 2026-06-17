import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

const createSchema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FLAT_INR", "FREE_DAYS", "COMMUNITY_SPECIFIC"]),
  discountValue: z.number().positive(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  minPurchase: z.number().nonnegative().optional(),
  planIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

const updateSchema = z.object({
  id: z.string(),
  isActive: z.boolean().optional(),
  usageLimit: z.number().int().positive().optional(),
  validUntil: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.SUBSCRIPTIONS_MANAGE_COUPONS]);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          planMappings: { include: { plan: { select: { name: true } } } },
          _count: { select: { usages: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count({ where }),
    ]);

    return apiResponse({ coupons, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.SUBSCRIPTIONS_MANAGE_COUPONS]);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { code, type, discountValue, usageLimit, validFrom, validUntil, minPurchase, planIds, isActive } = parsed.data;

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return apiError("Coupon code already exists", 409);

    if (type === "PERCENTAGE" && discountValue > 100) return apiError("Percentage discount cannot exceed 100%", 400);

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        discountValue,
        usageLimit,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        minPurchase,
        isActive,
        planMappings: planIds?.length ? {
          createMany: { data: planIds.map((planId) => ({ planId })) },
        } : undefined,
      },
      include: { planMappings: { include: { plan: { select: { name: true } } } } },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "SETTINGS_CHANGED",
        targetType: "Coupon",
        targetId: coupon.id,
        details: { code, type, discountValue },
      },
    });

    return apiResponse({ coupon }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.SUBSCRIPTIONS_MANAGE_COUPONS]);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { id, isActive, usageLimit, validUntil } = parsed.data;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(usageLimit !== undefined ? { usageLimit } : {}),
        ...(validUntil ? { validUntil: new Date(validUntil) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "SETTINGS_CHANGED",
        targetType: "Coupon",
        targetId: id,
        details: { isActive, usageLimit, validUntil },
      },
    });

    return apiResponse({ coupon });
  } catch (err) {
    return handleApiError(err);
  }
}
