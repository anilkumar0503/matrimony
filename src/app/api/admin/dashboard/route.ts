import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.ANALYTICS_VIEW_DASHBOARD]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeProfiles,
      pendingKyc,
      pendingImages,
      pendingApproval,
      totalMatches,
      openTickets,
      totalCommunities,
      revenueToday,
      revenueMonth,
      revenueYear,
      activeSubsByTier,
      dailyRegistrations,
      interestCount,
      matchCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.kYCSubmission.count({ where: { status: "PENDING" } }),
      prisma.profileImage.count({ where: { status: "PENDING", category: { in: ["PROFILE", "GALLERY"] } } }),
      prisma.user.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.mutualMatch.count(),
      prisma.matchTicket.count({ where: { status: { in: ["OPEN", "IN_REVIEW", "SCHEDULED"] } } }),
      prisma.community.count({ where: { isActive: true } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: yearStart } },
        _sum: { totalAmount: true },
      }),
      prisma.userSubscription.groupBy({
        by: ["planId"],
        where: { status: "ACTIVE" },
        _count: { id: true },
      }),
      prisma.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: last7Days } },
        _count: { id: true },
      }),
      prisma.interest.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.mutualMatch.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    const slaThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const kycSlaBreach = await prisma.kYCSubmission.count({
      where: { status: "PENDING", createdAt: { lt: slaThreshold } },
    });

    const dailyData: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyData[key] = 0;
    }
    for (const entry of dailyRegistrations) {
      const key = new Date(entry.createdAt).toISOString().split("T")[0];
      if (key in dailyData) dailyData[key] += entry._count.id;
    }

    const conversionRate = interestCount > 0 ? ((matchCount / interestCount) * 100).toFixed(1) : "0";

    return apiResponse({
      kpis: {
        totalUsers,
        activeProfiles,
        pendingKyc,
        kycSlaBreach,
        pendingImages,
        pendingApproval,
        totalMatches,
        openTickets,
        totalCommunities,
      },
      revenue: {
        today: revenueToday._sum.totalAmount || 0,
        thisMonth: revenueMonth._sum.totalAmount || 0,
        thisYear: revenueYear._sum.totalAmount || 0,
      },
      activeSubsByTier,
      dailyRegistrations: Object.entries(dailyData).map(([date, count]) => ({ date, count })),
      conversionRate,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
