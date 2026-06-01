import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search");
    const action = searchParams.get("action");

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (search) {
      where.OR = [
        { ipAddress: { contains: search } },
        { admin: { email: { contains: search, mode: "insensitive" } } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
        { targetId: { contains: search } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { admin: { select: { name: true, email: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return apiResponse({ logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return handleApiError(err);
  }
}
