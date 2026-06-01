import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { profile: { fullName: { contains: search, mode: "insensitive" } } },
        ],
      };
    }

    const [subscriptions, total, activeCount, expiredCount, revenueAgg] = await Promise.all([
      prisma.userSubscription.findMany({
        where,
        include: {
          plan: { select: { name: true, tier: true, priceYearly: true } },
          user: { select: { email: true, profile: { select: { fullName: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.userSubscription.count({ where }),
      prisma.userSubscription.count({ where: { status: "ACTIVE" } }),
      prisma.userSubscription.count({ where: { status: "EXPIRED" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { totalAmount: true },
      }),
    ]);

    return apiResponse({
      subscriptions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        total: await prisma.userSubscription.count(),
        active: activeCount,
        expired: expiredCount,
        revenue: revenueAgg._sum.totalAmount || 0,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
