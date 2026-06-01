import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    
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
      isActive,
      communityId
    } = body;

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(tier && { tier }),
        ...(description !== undefined && { description }),
        ...(priceMonthly !== undefined && { priceMonthly: priceMonthly ? parseFloat(priceMonthly) : null }),
        ...(priceQuarterly !== undefined && { priceQuarterly: priceQuarterly ? parseFloat(priceQuarterly) : null }),
        ...(priceYearly !== undefined && { priceYearly: priceYearly ? parseFloat(priceYearly) : null }),
        ...(durationDays !== undefined && { durationDays: durationDays ? parseInt(durationDays) : null }),
        ...(wishlistLimit !== undefined && { wishlistLimit: wishlistLimit ? parseInt(wishlistLimit) : null }),
        ...(interestLimit !== undefined && { interestLimit: interestLimit ? parseInt(interestLimit) : null }),
        ...(features !== undefined && { features }),
        ...(isActive !== undefined && { isActive }),
        ...(communityId !== undefined && { communityId })
      }
    });

    return apiResponse({ plan });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.userSubscription.count({
      where: { planId: id, status: 'ACTIVE' }
    });

    if (activeSubscriptions > 0) {
      return apiError("Cannot delete plan with active subscriptions", 400);
    }

    await prisma.subscriptionPlan.delete({
      where: { id }
    });

    return apiResponse({ message: "Plan deleted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
