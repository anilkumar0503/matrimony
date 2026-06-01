import { NextRequest } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getSetting, SETTINGS_KEYS, getGSTRate } from "@/lib/platform-settings";
import { calcGST } from "@/lib/utils";

const schema = z.object({
  planId: z.string(),
  duration: z.enum(["monthly", "quarterly", "yearly"]),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { planId, duration, couponCode } = parsed.data;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId, isActive: true } });
    if (!plan) return apiError("Plan not found or inactive", 404);

    const priceMap = { monthly: plan.priceMonthly, quarterly: plan.priceQuarterly, yearly: plan.priceYearly };
    let baseAmount = priceMap[duration];
    if (!baseAmount) return apiError("Selected duration not available for this plan", 400);

    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
          planMappings: { some: { planId } },
        },
      });

      if (!coupon) return apiError("Invalid or expired coupon code", 400);
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return apiError("Coupon usage limit reached", 400);
      }

      if (coupon.isUserSpecific && coupon.specificUserId !== user.id) {
        return apiError("This coupon is not valid for your account", 400);
      }

      const alreadyUsed = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, userId: user.id },
      });
      if (coupon.type === "FIRST_TIME" && alreadyUsed) {
        return apiError("This coupon is for first-time use only", 400);
      }

      if (coupon.type === "PERCENTAGE") {
        baseAmount = baseAmount - (baseAmount * coupon.discountValue) / 100;
      } else if (coupon.type === "FLAT_INR") {
        baseAmount = Math.max(0, baseAmount - coupon.discountValue);
      }
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { state: true },
    });
    const gstRate = await getGSTRate();
    const platformState = await getSetting(SETTINGS_KEYS.PLATFORM_STATE);
    const { cgst, sgst, igst, total } = calcGST(baseAmount, gstRate, profile?.state || undefined, platformState || "Tamil Nadu");

    const keyId = await getSetting(SETTINGS_KEYS.RAZORPAY_KEY_ID);
    const keySecret = await getSetting(SETTINGS_KEYS.RAZORPAY_KEY_SECRET);

    if (!keyId || !keySecret) return apiError("Payment gateway not configured", 503);

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: `rcpt_${user.id}_${Date.now()}`,
      notes: { planId, userId: user.id, duration },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        amount: baseAmount,
        gstAmount: cgst + sgst + igst,
        totalAmount: total,
        status: "PENDING",
      },
    });

    return apiResponse({
      orderId: order.id,
      paymentId: payment.id,
      amount: total,
      amountPaise: Math.round(total * 100),
      gst: { rate: gstRate, cgst, sgst, igst },
      baseAmount,
      couponApplied: coupon ? { code: coupon.code, savings: priceMap[duration]! - baseAmount } : null,
      keyId,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
