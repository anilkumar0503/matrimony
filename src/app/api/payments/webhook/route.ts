import { NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/auth";
import { getSetting, SETTINGS_KEYS, getNextInvoiceNumber } from "@/lib/platform-settings";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";
import { addDays, formatDate } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = await getSetting(SETTINGS_KEYS.RAZORPAY_KEY_SECRET);

    if (webhookSecret && signature) {
      const expectedSig = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
      if (expectedSig !== signature) return apiError("Invalid webhook signature", 400, "INVALID_SIGNATURE");
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    if (eventType === "payment.captured") {
      const razorpayPaymentId: string = payload.payment.entity.id;
      const razorpayOrderId: string = payload.payment.entity.order_id;
      const amountPaise: number = payload.payment.entity.amount;

      const existingPayment = await prisma.payment.findFirst({
        where: { razorpayPaymentId },
      });
      if (existingPayment) return apiResponse({ status: "already_processed" });

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId },
      });
      if (!payment) return apiError("Payment record not found", 404);

      const notes = payload.payment.entity.notes as Record<string, string>;
      const { planId, userId, duration } = notes;
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) return apiError("Plan not found", 404);

      const durationDaysMap: Record<string, number> = { monthly: 30, quarterly: 90, yearly: 365 };
      const durationDays = plan.durationDays || durationDaysMap[duration] || 30;

      const startDate = new Date();
      const endDate = addDays(startDate, durationDays);
      const gracePeriodEnd = addDays(endDate, 7);

      await prisma.userSubscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      });

      const subscription = await prisma.userSubscription.create({
        data: {
          userId,
          planId,
          status: "ACTIVE",
          startDate,
          endDate,
          gracePeriodEnd,
          autoRenew: true,
        },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          status: "SUCCESS",
          subscriptionId: subscription.id,
        },
      });

      // Generate invoice
      const invoiceNumber = await getNextInvoiceNumber();
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: { select: { fullName: true, state: true } } },
      });

      const invoiceDate = new Date();
      await prisma.invoice.create({
        data: {
          paymentId: payment.id,
          invoiceNumber,
          invoiceDate,
          userId,
          planName: plan.name,
          baseAmount: payment.amount,
          gstRate: 18,
          cgst: payment.gstAmount / 2,
          sgst: payment.gstAmount / 2,
          totalAmount: payment.totalAmount,
          customerName: user?.profile?.fullName || user?.email || "",
          customerEmail: user?.email || "",
          customerState: user?.profile?.state || "",
        },
      });

      await sendNotification({
        userId,
        event: NOTIFICATION_EVENTS.SUBSCRIPTION_ACTIVATED,
        variables: {
          user_name: user?.email || "",
          plan_name: plan.name,
          end_date: formatDate(endDate, "dd MMM yyyy"),
        },
      });

      await sendNotification({
        userId,
        event: NOTIFICATION_EVENTS.PAYMENT_CONFIRMED,
        variables: {
          user_name: user?.email || "",
          amount: payment.totalAmount.toString(),
          invoice_number: invoiceNumber,
        },
      });
    } else if (eventType === "payment.failed") {
      const razorpayOrderId: string = payload.payment.entity.order_id;
      const payment = await prisma.payment.findFirst({ where: { razorpayOrderId } });
      if (payment) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        await sendNotification({
          userId: payment.userId,
          event: NOTIFICATION_EVENTS.PAYMENT_FAILED,
          variables: { user_name: "", amount: payment.totalAmount.toString() },
        });
      }
    }

    return apiResponse({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return apiError("Webhook processing failed", 500);
  }
}
