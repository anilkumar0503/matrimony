import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

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
