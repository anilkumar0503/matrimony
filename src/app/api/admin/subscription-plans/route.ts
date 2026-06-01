import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { tier: 'asc' },
      include: {
        community: {
          select: { id: true, name: true }
        }
      }
    });

    return apiResponse({ plans });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const body = await req.json();
    const {
      name,
      tier,
      description,
      priceMonthly,
      priceQuarterly,
      priceYearly,
      durationDays,
      wishlistLimit,
      interestLimit,
      features,
      communityId
    } = body;

    // Validate required fields
    if (!name || !tier) {
      return apiError("Name and tier are required", 400);
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        tier,
        description,
        priceMonthly: priceMonthly ? parseFloat(priceMonthly) : null,
        priceQuarterly: priceQuarterly ? parseFloat(priceQuarterly) : null,
        priceYearly: priceYearly ? parseFloat(priceYearly) : null,
        durationDays: durationDays ? parseInt(durationDays) : null,
        wishlistLimit: wishlistLimit ? parseInt(wishlistLimit) : null,
        interestLimit: interestLimit ? parseInt(interestLimit) : null,
        features: features || [],
        communityId
      }
    });

    return apiResponse({ plan }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
