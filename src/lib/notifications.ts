import prisma from "./prisma";
import { getSetting, SETTINGS_KEYS } from "./platform-settings";

export const NOTIFICATION_EVENTS = {
  EMAIL_OTP: "email.otp",
  PROFILE_APPROVED: "profile.approved",
  PROFILE_REJECTED: "profile.rejected",
  KYC_APPROVED: "kyc.approved",
  KYC_REJECTED: "kyc.rejected",
  IMAGE_APPROVED: "image.approved",
  IMAGE_REJECTED: "image.rejected",
  INTEREST_RECEIVED: "interest.received",
  INTEREST_ACCEPTED: "interest.accepted",
  INTEREST_DECLINED: "interest.declined",
  MUTUAL_MATCH: "match.mutual",
  MEETING_SCHEDULED: "match.meeting_scheduled",
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  SUBSCRIPTION_EXPIRY_REMINDER: "subscription.expiry_reminder",
  PAYMENT_CONFIRMED: "payment.confirmed",
  PAYMENT_FAILED: "payment.failed",
  REFUND_PROCESSED: "refund.processed",
  ACCOUNT_DELETION_CONFIRMED: "account.deletion_confirmed",
  DATA_EXPORT_READY: "data.export_ready",
  INACTIVITY_WARNING: "inactivity.warning",
  DATA_BREACH: "data.breach",
} as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

interface SendNotificationOptions {
  userId: string;
  event: NotificationEvent;
  variables?: Record<string, string>;
  channels?: ("EMAIL" | "IN_APP" | "SMS")[];
}

export async function sendNotification(opts: SendNotificationOptions): Promise<void> {
  const { userId, event, variables = {}, channels } = opts;

  const template = await prisma.notificationTemplate.findUnique({ where: { eventKey: event } });

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId, eventKey: event },
  });

  const prefMap = Object.fromEntries(prefs.map((p) => [p.eventKey, p]));
  const userPref = prefMap[event];

  const smsEnabled = (await getSetting(SETTINGS_KEYS.SMS_ENABLED)) === "true";

  const activeChannels = channels || (["EMAIL", "IN_APP", "SMS"] as const);

  for (const channel of activeChannels) {
    if (channel === "SMS" && !smsEnabled) continue;
    if (userPref) {
      if (channel === "EMAIL" && !userPref.email) continue;
      if (channel === "IN_APP" && !userPref.inApp) continue;
      if (channel === "SMS" && !userPref.sms) continue;
    }

    let subject: string | undefined;
    let body = "";

    if (template) {
      if (channel === "EMAIL") {
        subject = interpolate(template.emailSubject || "", variables);
        body = interpolate(template.emailBody || "", variables);
      } else if (channel === "IN_APP") {
        body = interpolate(template.inAppBody || "", variables);
      } else if (channel === "SMS") {
        body = interpolate(template.smsBody || "", variables);
      }
    }

    if (!body) continue;

    await prisma.notification.create({
      data: {
        userId,
        channel,
        eventKey: event,
        subject,
        body,
        status: "PENDING",
      },
    });
  }
}

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

export async function sendEmailDirect(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const provider = process.env.MAIL_MAILER || await getSetting(SETTINGS_KEYS.EMAIL_PROVIDER);
  const from = process.env.EMAIL_FROM || await getSetting(SETTINGS_KEYS.EMAIL_FROM);
  const fromName = process.env.EMAIL_FROM_NAME || await getSetting(SETTINGS_KEYS.EMAIL_FROM_NAME);

  const nodemailer = require("nodemailer");

  if (provider === "SMTP" || provider === "smtp") {
    const host = process.env.MAIL_HOST;
    const port = parseInt(process.env.MAIL_PORT || "2525");
    const username = process.env.MAIL_USERNAME;
    const password = process.env.MAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user: username,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: `"${fromName || "Premium Matrimony"}" <${from || "noreply@matrimony.com"}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } else if (provider === "SENDGRID") {
    const sgMail = require("@sendgrid/mail");
    const apiKey = process.env.SENDGRID_API_KEY || await getSetting(SETTINGS_KEYS.SENDGRID_API_KEY);
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to: opts.to,
      from: { email: from || "noreply@matrimony.com", name: fromName || "Premium Matrimony" },
      subject: opts.subject,
      html: opts.html,
    });
  } else {
    // AWS SES fallback
    const region = process.env.AWS_SES_REGION || await getSetting(SETTINGS_KEYS.AWS_SES_REGION);
    const accessKey = process.env.AWS_SES_ACCESS_KEY || await getSetting(SETTINGS_KEYS.AWS_SES_ACCESS_KEY);
    const secretKey = process.env.AWS_SES_SECRET_KEY || await getSetting(SETTINGS_KEYS.AWS_SES_SECRET_KEY);

    const transporter = nodemailer.createTransport({
      host: `email.${region || "ap-south-1"}.amazonaws.com`,
      port: 587,
      auth: {
        user: accessKey,
        pass: secretKey,
      },
    });

    await transporter.sendMail({
      from: `"${fromName || "Premium Matrimony"}" <${from || "noreply@matrimony.com"}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }
}
