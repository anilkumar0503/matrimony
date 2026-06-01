import { PrismaClient } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "../src/lib/permissions";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ["query", "error", "warn"],
});

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create permissions
  console.log("  Creating permissions...");
  const permissionData = Object.values(PERMISSIONS).map((code) => {
    const [module] = code.split(".");
    return {
      code,
      description: code.replace(/\./g, " ").replace(/_/g, " "),
      module,
    };
  });

  for (const perm of permissionData) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      create: perm,
      update: perm,
    });
  }

  // 2. Create default roles
  console.log("  Creating roles...");
  const roleNames = Object.keys(DEFAULT_ROLE_PERMISSIONS);
  for (const roleName of roleNames) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      create: {
        name: roleName,
        description: `Default ${roleName} role`,
        isDefault: true,
        isEditable: roleName !== "Super Admin",
      },
      update: {},
    });

    // 3. Assign permissions to roles
    const perms = DEFAULT_ROLE_PERMISSIONS[roleName];
    for (const permCode of perms) {
      const perm = await prisma.permission.findUnique({ where: { code: permCode } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        create: { roleId: role.id, permissionId: perm.id },
        update: {},
      });
    }
  }

  // 4. Create Super Admin user
  console.log("  Creating Super Admin...");
  const superAdminRole = await prisma.role.findUnique({ where: { name: "Super Admin" } });
  if (superAdminRole) {
    const passwordHash = await bcrypt.hash("Admin@123456", 12);
    await prisma.adminUser.upsert({
      where: { email: "admin@matrimony.local" },
      create: {
        email: "admin@matrimony.local",
        passwordHash,
        name: "Super Admin",
        roleId: superAdminRole.id,
        isActive: true,
      },
      update: {
        passwordHash,
        isActive: true,
      },
    });
  }

  // 5. Create default platform settings
  console.log("  Creating platform settings...");
  const defaultSettings = [
    { key: "app.name", value: "Premium Matrimony", isSecret: false },
    { key: "gst.rate", value: "18", isSecret: false },
    { key: "gst.type", value: "CGST_SGST", isSecret: false },
    { key: "platform.state", value: "Tamil Nadu", isSecret: false },
    { key: "invoice.prefix", value: "INV-", isSecret: false },
    { key: "invoice.start_number", value: "1000", isSecret: false },
    { key: "invoice.current_number", value: "1000", isSecret: false },
    { key: "kyc.mode_b_enabled", value: "true", isSecret: false },
    { key: "kyc.mode_c_enabled", value: "false", isSecret: false },
    { key: "kyc.max_attempts", value: "3", isSecret: false },
    { key: "email.provider", value: "SENDGRID", isSecret: false },
    { key: "email.from", value: "noreply@matrimony.local", isSecret: false },
    { key: "email.from_name", value: "Premium Matrimony", isSecret: false },
    { key: "sms.enabled", value: "false", isSecret: false },
    { key: "refund.free_window_hours", value: "24", isSecret: false },
    { key: "refund.type_after_window", value: "PRORATED", isSecret: false },
    { key: "refund.admin_type", value: "NO_REFUND", isSecret: false },
    { key: "retention.inactive_months", value: "24", isSecret: false },
    { key: "retention.post_deletion_days", value: "30", isSecret: false },
    { key: "interest.expiry_days", value: "30", isSecret: false },
    { key: "image.max_per_profile", value: "5", isSecret: false },
    { key: "image.max_size_mb", value: "5", isSecret: false },
    { key: "image.watermark_enabled", value: "true", isSecret: false },
    { key: "image.watermark_text", value: "Premium Matrimony", isSecret: false },
    { key: "image.moderation_sla_hours", value: "24", isSecret: false },
    { key: "image.moderation_alert_threshold", value: "20", isSecret: false },
    { key: "platform.maintenance_mode", value: "false", isSecret: false },
    { key: "razorpay.mode", value: "test", isSecret: false },
    { key: "digio.env", value: "sandbox", isSecret: false },
    { key: "dpo.name", value: "Data Protection Officer", isSecret: false },
    { key: "dpo.email", value: "dpo@matrimony.local", isSecret: false },
  ];

  for (const s of defaultSettings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      create: { ...s, updatedBy: "seed" },
      update: {},
    });
  }

  // 6. Default notification templates
  console.log("  Creating notification templates...");
  const templates = [
    {
      eventKey: "email.otp",
      label: "Email OTP",
      emailSubject: "Your Verification OTP — {{app_name}}",
      emailBody: "<p>Hello,</p><p>Your OTP for verification is: <strong>{{otp}}</strong></p><p>This OTP expires in 10 minutes. Do not share it with anyone.</p>",
    },
    {
      eventKey: "profile.approved",
      label: "Profile Approved",
      emailSubject: "Your profile has been approved — {{app_name}}",
      emailBody: "<p>Congratulations {{user_name}}!</p><p>Your profile has been approved and is now visible on {{app_name}}.</p>",
      inAppBody: "Your profile has been approved and is now live!",
      smsBody: "Hi {{user_name}}, your {{app_name}} profile is approved!",
    },
    {
      eventKey: "profile.rejected",
      label: "Profile Rejected",
      emailSubject: "Profile verification update — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your profile requires attention. Reason: {{reason}}</p><p>Please update your profile and resubmit.</p>",
      inAppBody: "Your profile was not approved. Reason: {{reason}}",
      smsBody: "Hi {{user_name}}, your {{app_name}} profile needs attention. Check app for details.",
    },
    {
      eventKey: "kyc.approved",
      label: "KYC Approved",
      emailSubject: "KYC Verified — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your KYC has been verified successfully!</p>",
      inAppBody: "Your KYC verification is complete.",
      smsBody: "Hi {{user_name}}, your KYC is verified on {{app_name}}.",
    },
    {
      eventKey: "kyc.rejected",
      label: "KYC Rejected",
      emailSubject: "KYC verification failed — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your KYC verification failed. Reason: {{reason}}</p><p>Please resubmit your KYC documents.</p>",
      inAppBody: "KYC rejected: {{reason}}. Please resubmit.",
      smsBody: "Hi {{user_name}}, your KYC on {{app_name}} failed. Check app.",
    },
    {
      eventKey: "interest.received",
      label: "Interest Received",
      emailSubject: "Someone is interested in you — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>You have received a new interest. Log in to view the profile.</p>",
      inAppBody: "You received a new interest!",
      smsBody: "Hi {{user_name}}, you received a new interest on {{app_name}}!",
    },
    {
      eventKey: "interest.accepted",
      label: "Interest Accepted",
      emailSubject: "Your interest was accepted — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your interest has been accepted!</p>",
      inAppBody: "Your interest was accepted!",
      smsBody: "Hi {{user_name}}, your interest was accepted on {{app_name}}!",
    },
    {
      eventKey: "match.mutual",
      label: "Mutual Match",
      emailSubject: "You have a mutual match — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Congratulations! You have a mutual match. Our team will be in touch to assist further.</p>",
      inAppBody: "Mutual match confirmed! Our team will assist you shortly.",
      smsBody: "Hi {{user_name}}, mutual match on {{app_name}}! Check your app.",
    },
    {
      eventKey: "match.meeting_scheduled",
      label: "Meeting Scheduled",
      emailSubject: "Meeting scheduled — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>A meeting has been scheduled for you on {{meeting_date}}.</p><p>Meeting link: {{meeting_link}}</p>",
      inAppBody: "Meeting scheduled on {{meeting_date}}.",
      smsBody: "Hi {{user_name}}, your meeting is on {{meeting_date}}. Check app for details.",
    },
    {
      eventKey: "subscription.activated",
      label: "Subscription Activated",
      emailSubject: "Subscription activated — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your {{plan_name}} subscription is now active until {{end_date}}.</p>",
      inAppBody: "{{plan_name}} subscription activated!",
      smsBody: "Hi {{user_name}}, {{plan_name}} activated on {{app_name}} until {{end_date}}.",
    },
    {
      eventKey: "payment.confirmed",
      label: "Payment Confirmed",
      emailSubject: "Payment confirmed — ₹{{amount}} — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Payment of ₹{{amount}} confirmed. Invoice: {{invoice_number}}</p>",
      smsBody: "Payment ₹{{amount}} confirmed. Invoice: {{invoice_number}}.",
    },
    {
      eventKey: "payment.failed",
      label: "Payment Failed",
      emailSubject: "Payment failed — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your payment of ₹{{amount}} failed. Please retry.</p>",
      inAppBody: "Payment failed. Please retry.",
      smsBody: "Payment failed on {{app_name}}. Please retry.",
    },
    {
      eventKey: "account.deletion_confirmed",
      label: "Account Deletion Confirmed",
      emailSubject: "Account deletion request received — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your account deletion request has been received. Your account will be deleted within 30 days. You can cancel this request within 7 days by logging in.</p>",
    },
    {
      eventKey: "data.export_ready",
      label: "Data Export Ready",
      emailSubject: "Your data export is ready — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your data export is ready. <a href='{{download_url}}'>Download here</a> (link valid for 48 hours).</p>",
      inAppBody: "Your data export is ready for download.",
    },
    {
      eventKey: "inactivity.warning",
      label: "Inactivity Warning",
      emailSubject: "Your account will be deleted due to inactivity — {{app_name}}",
      emailBody: "<p>Hi {{user_name}},</p><p>Your account has been inactive for 24 months. It will be deleted in 30 days unless you log in.</p>",
    },
  ];

  for (const t of templates) {
    await prisma.notificationTemplate.upsert({
      where: { eventKey: t.eventKey },
      create: t,
      update: t,
    });
  }

  // 7. Default field visibility config
  console.log("  Creating field visibility config...");
  const fieldVisibility = [
    { fieldKey: "display_name", guestVisible: true, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "profile_photo_thumb", guestVisible: true, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "profile_photo_full", guestVisible: false, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "age", guestVisible: true, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "height", guestVisible: false, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "religion_caste", guestVisible: false, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "education", guestVisible: false, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "occupation", guestVisible: false, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "income_range", guestVisible: false, registeredVisible: false, communityVisible: false, premiumVisible: true },
    { fieldKey: "location", guestVisible: false, registeredVisible: true, communityVisible: true, premiumVisible: true },
    { fieldKey: "phone", guestVisible: false, registeredVisible: false, communityVisible: false, premiumVisible: false },
    { fieldKey: "email", guestVisible: false, registeredVisible: false, communityVisible: false, premiumVisible: false },
    { fieldKey: "family_details", guestVisible: false, registeredVisible: false, communityVisible: false, premiumVisible: true },
    { fieldKey: "horoscope_details", guestVisible: false, registeredVisible: false, communityVisible: false, premiumVisible: true },
    { fieldKey: "kyc_verified_badge", guestVisible: true, registeredVisible: true, communityVisible: true, premiumVisible: true },
  ];

  for (const fv of fieldVisibility) {
    await prisma.fieldVisibilityConfig.upsert({
      where: { fieldKey: fv.fieldKey },
      create: { ...fv, updatedBy: "seed" },
      update: {},
    });
  }

  // 8. Default subscription plans
  console.log("  Creating default subscription plans...");
  const plans = [
    {
      name: "Free",
      tier: "FREE" as const,
      description: "Basic access to find your life partner",
      wishlistLimit: 5,
      interestLimit: 3,
      isDefault: true,
      features: [
        "Basic profile search",
        "Send 3 interests/month",
        "5 wishlist slots",
        "View profiles",
        "KYC verification",
      ],
    },
    {
      name: "Premium",
      tier: "PREMIUM" as const,
      description: "Enhanced features for serious matchmaking",
      priceMonthly: 999,
      priceQuarterly: 2499,
      priceYearly: 7999,
      durationDays: 30,
      wishlistLimit: 25,
      interestLimit: 20,
      features: [
        "Advanced search filters",
        "Send 20 interests/month",
        "25 wishlist slots",
        "View contact details",
        "Anonymous browsing",
        "Who viewed me (full)",
        "Photo gallery (10 photos)",
        "Priority listing",
        "Premium badge",
      ],
    },
    {
      name: "VIP",
      tier: "VIP" as const,
      description: "Unlimited access with priority admin assistance",
      priceMonthly: 2499,
      priceQuarterly: 5999,
      priceYearly: 19999,
      durationDays: 30,
      wishlistLimit: null,
      interestLimit: null,
      features: [
        "Unlimited interests",
        "Unlimited wishlist",
        "Advanced search filters",
        "View contact details",
        "Anonymous browsing",
        "Who viewed me (full)",
        "Photo gallery (unlimited)",
        "Priority listing",
        "VIP badge",
        "Admin-assisted matchmaking",
        "Priority support",
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: `plan_${plan.tier.toLowerCase()}` },
      create: { id: `plan_${plan.tier.toLowerCase()}`, ...plan },
      update: plan,
    });
  }

  console.log("✅ Seeding complete!");
  console.log("\n📋 Default Admin Credentials:");
  console.log("   Email: admin@matrimony.local");
  console.log("   Password: Admin@123456");
  console.log("   ⚠️  CHANGE THIS PASSWORD BEFORE GOING LIVE!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
