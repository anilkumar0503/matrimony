import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: { _count: { select: { members: { where: { status: "APPROVED" } } } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.community.count({ where }),
    ]);

    return apiResponse({ communities, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return handleApiError(err);
  }
}

const joinSchema = z.object({ communityId: z.string() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { communityId } = parsed.data;

    const community = await prisma.community.findUnique({ where: { id: communityId, isActive: true } });
    if (!community) return apiError("Community not found", 404);

    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: user.id, communityId } },
    });
    if (existing) return apiError("Already a member or request pending", 409);

    const member = await prisma.communityMember.create({
      data: { communityId, userId: user.id, status: "APPROVED" },
    });

    return apiResponse({ member, message: "Joined successfully!" }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
