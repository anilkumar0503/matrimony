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
      where.OR = [
        { razorpayOrderId: { contains: search } },
        { razorpayPaymentId: { contains: search } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { profile: { fullName: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [payments, total, successAgg, gstAgg, successCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: { select: { email: true, profile: { select: { fullName: true } } } },
          subscription: { select: { plan: { select: { name: true, tier: true } } } },
          invoice: { select: { invoiceNumber: true, fileUrl: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { gstAmount: true } }),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
    ]);

    return apiResponse({
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: {
        totalRevenue: successAgg._sum.amount || 0,
        totalGst: gstAgg._sum.gstAmount || 0,
        count: successCount,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
