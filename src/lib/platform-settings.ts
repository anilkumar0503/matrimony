import prisma from "./prisma";
import { redis, CACHE_KEYS } from "./redis";

export const SETTINGS_KEYS = {
  // Payment
  RAZORPAY_KEY_ID: "razorpay.key_id",
  RAZORPAY_KEY_SECRET: "razorpay.key_secret",
  RAZORPAY_MODE: "razorpay.mode",

  // GST
  GST_RATE: "gst.rate",
  GST_TYPE: "gst.type",
  PLATFORM_STATE: "platform.state",

  // Business
  BUSINESS_NAME: "business.name",
  BUSINESS_GSTIN: "business.gstin",
  BUSINESS_ADDRESS: "business.address",
  INVOICE_PREFIX: "invoice.prefix",
  INVOICE_START_NUMBER: "invoice.start_number",
  INVOICE_CURRENT_NUMBER: "invoice.current_number",

  // KYC
  KYC_MODE_B_ENABLED: "kyc.mode_b_enabled",
  KYC_MODE_C_ENABLED: "kyc.mode_c_enabled",
  DIGIO_CLIENT_ID: "digio.client_id",
  DIGIO_CLIENT_SECRET: "digio.client_secret",
  DIGIO_ENV: "digio.env",
  KYC_MAX_ATTEMPTS: "kyc.max_attempts",

  // Email
  EMAIL_PROVIDER: "email.provider",
  AWS_SES_REGION: "aws.ses.region",
  AWS_SES_ACCESS_KEY: "aws.ses.access_key",
  AWS_SES_SECRET_KEY: "aws.ses.secret_key",
  SENDGRID_API_KEY: "sendgrid.api_key",
  EMAIL_FROM: "email.from",
  EMAIL_FROM_NAME: "email.from_name",

  // SMS
  SMS_ENABLED: "sms.enabled",
  SMS_GATEWAY_KEY: "sms.gateway_key",
  SMS_SENDER_ID: "sms.sender_id",

  // Refund Policy
  REFUND_FREE_WINDOW_HOURS: "refund.free_window_hours",
  REFUND_TYPE_AFTER_WINDOW: "refund.type_after_window",
  REFUND_ADMIN_TYPE: "refund.admin_type",

  // DPDP
  DPO_NAME: "dpo.name",
  DPO_EMAIL: "dpo.email",
  DPO_PHONE: "dpo.phone",
  RETENTION_INACTIVE_MONTHS: "retention.inactive_months",
  RETENTION_POST_DELETION_DAYS: "retention.post_deletion_days",

  // Platform
  APP_NAME: "app.name",
  STAGING_DOMAIN: "deploy.staging_domain",
  PRODUCTION_DOMAIN: "deploy.production_domain",
  MAINTENANCE_MODE: "platform.maintenance_mode",
  MAINTENANCE_MESSAGE: "platform.maintenance_message",

  // Interest
  INTEREST_EXPIRY_DAYS: "interest.expiry_days",

  // Image
  IMAGE_MAX_PER_PROFILE: "image.max_per_profile",
  IMAGE_MAX_SIZE_MB: "image.max_size_mb",
  IMAGE_WATERMARK_ENABLED: "image.watermark_enabled",
  IMAGE_WATERMARK_TEXT: "image.watermark_text",
  IMAGE_MODERATION_SLA_HOURS: "image.moderation_sla_hours",
  IMAGE_MODERATION_ALERT_THRESHOLD: "image.moderation_alert_threshold",
} as const;

export type SettingKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS];

const CACHE_TTL = 60 * 5; // 5 minutes

export async function getSetting(key: SettingKey): Promise<string | null> {
  try {
    const cached = await redis.hget(CACHE_KEYS.platformSettings(), key);
    if (cached !== null) return cached;
  } catch {
    // Redis unavailable, continue to database
  }

  const setting = await prisma.platformSetting.findUnique({ where: { key } });
  if (setting) {
    try {
      await redis.hset(CACHE_KEYS.platformSettings(), key, setting.value);
      await redis.expire(CACHE_KEYS.platformSettings(), CACHE_TTL);
    } catch {
      // Redis unavailable, skip caching
    }
  }
  return setting?.value ?? null;
}

export async function getSettingOrDefault(key: SettingKey, defaultValue: string): Promise<string> {
  return (await getSetting(key)) ?? defaultValue;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.platformSetting.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export async function setSetting(
  key: SettingKey,
  value: string,
  updatedBy: string,
  isSecret = false
): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { key },
    create: { key, value, isSecret, updatedBy },
    update: { value, updatedBy },
  });
  try {
    await redis.del(CACHE_KEYS.platformSettings());
  } catch {
    // Redis unavailable, skip cache invalidation
  }
}

export async function getGSTRate(): Promise<number> {
  return parseFloat(await getSettingOrDefault(SETTINGS_KEYS.GST_RATE, "18"));
}

export async function getAppName(): Promise<string> {
  return getSettingOrDefault(SETTINGS_KEYS.APP_NAME, "Premium Matrimony");
}

export async function isMaintenanceMode(): Promise<boolean> {
  return (await getSetting(SETTINGS_KEYS.MAINTENANCE_MODE)) === "true";
}

export async function getNextInvoiceNumber(): Promise<string> {
  const prefix = await getSettingOrDefault(SETTINGS_KEYS.INVOICE_PREFIX, "INV-");
  const current = parseInt(await getSettingOrDefault(SETTINGS_KEYS.INVOICE_CURRENT_NUMBER, "1000"));
  const next = current + 1;
  await prisma.platformSetting.upsert({
    where: { key: SETTINGS_KEYS.INVOICE_CURRENT_NUMBER },
    create: { key: SETTINGS_KEYS.INVOICE_CURRENT_NUMBER, value: next.toString(), updatedBy: "system" },
    update: { value: next.toString(), updatedBy: "system" },
  });
  return `${prefix}${next}`;
}
