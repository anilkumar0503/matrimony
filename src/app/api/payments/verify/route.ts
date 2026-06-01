import { NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { addDays } from "date-fns";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { getSetting, SETTINGS_KEYS, getNextInvoiceNumber } from "@/lib/platform-settings";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  planId: z.string().optional(),
  duration: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, duration } = parsed.data;

    const keySecret = await getSetting(SETTINGS_KEYS.RAZORPAY_KEY_SECRET);
    if (!keySecret) return apiError("Payment gateway not configured", 503);

    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return apiError("Invalid payment signature", 400, "INVALID_SIGNATURE");
    }

    const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: razorpay_order_id } });
    if (!payment) return apiError("Payment record not found", 404);

    if (payment.status === "SUCCESS") {
      return apiResponse({ verified: true, alreadyProcessed: true, message: "Payment already processed." });
    }

    const resolvedPlanId = planId || (await prisma.userSubscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { planId: true } }))?.planId;
    if (!resolvedPlanId) return apiError("Plan ID not found", 400);

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: resolvedPlanId } });
    if (!plan) return apiError("Plan not found", 404);

    const durationDaysMap: Record<string, number> = { monthly: 30, quarterly: 90, yearly: 365 };
    const durationDays = plan.durationDays || durationDaysMap[duration || "monthly"] || 30;

    const startDate = new Date();
    const endDate = addDays(startDate, durationDays);
    const gracePeriodEnd = addDays(endDate, 7);

    await prisma.userSubscription.updateMany({ where: { userId: user.id, status: "ACTIVE" }, data: { status: "EXPIRED" } });

    const subscription = await prisma.userSubscription.create({
      data: { userId: user.id, planId: resolvedPlanId, status: "ACTIVE", startDate, endDate, gracePeriodEnd, autoRenew: true },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { razorpayPaymentId: razorpay_payment_id, status: "SUCCESS", subscriptionId: subscription.id },
    });

    const invoiceNumber = await getNextInvoiceNumber();
    const userData = await prisma.user.findUnique({ where: { id: user.id }, include: { profile: { select: { fullName: true, state: true } } } });
    await prisma.invoice.create({
      data: {
        paymentId: payment.id, invoiceNumber, invoiceDate: new Date(), userId: user.id,
        planName: plan.name, baseAmount: payment.amount, gstRate: 18,
        cgst: payment.gstAmount / 2, sgst: payment.gstAmount / 2, totalAmount: payment.totalAmount,
        customerName: userData?.profile?.fullName || userData?.email || "",
        customerEmail: userData?.email || "", customerState: userData?.profile?.state || "",
      },
    });

    await sendNotification({
      userId: user.id,
      event: NOTIFICATION_EVENTS.SUBSCRIPTION_ACTIVATED,
      variables: { user_name: userData?.email || "", plan_name: plan.name, end_date: endDate.toLocaleDateString("en-IN") },
    });

    return apiResponse({ verified: true, message: "Payment verified and subscription activated!", subscription });
  } catch (err) {
    return handleApiError(err);
  }
}
