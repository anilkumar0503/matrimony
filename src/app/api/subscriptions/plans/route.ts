import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiResponse, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const where: Record<string, unknown> = { isActive: true };
    if (communityId) {
      where.OR = [{ communityId }, { communityId: null }];
    } else {
      where.communityId = null;
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: { tier: "asc" },
    });

    return apiResponse({ plans });
  } catch (err) {
    return handleApiError(err);
  }
}
