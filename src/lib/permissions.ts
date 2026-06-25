export const PERMISSIONS = {
  // User Management
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_APPROVE: "users.approve",
  USERS_SUSPEND: "users.suspend",
  USERS_DELETE: "users.delete",
  USERS_EDIT: "users.edit",

  // KYC
  KYC_VIEW: "kyc.view",
  KYC_APPROVE: "kyc.approve",
  KYC_REJECT: "kyc.reject",

  // Images
  IMAGES_VIEW: "images.view",
  IMAGES_APPROVE: "images.approve",
  IMAGES_REJECT: "images.reject",

  // Subscriptions
  SUBSCRIPTIONS_VIEW: "subscriptions.view",
  SUBSCRIPTIONS_MANAGE_PLANS: "subscriptions.manage_plans",
  SUBSCRIPTIONS_MANAGE_COUPONS: "subscriptions.manage_coupons",
  SUBSCRIPTIONS_OVERRIDE: "subscriptions.override",

  // Payments
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_REFUND: "payments.refund",
  PAYMENTS_EXPORT: "payments.export",

  // Communities
  COMMUNITIES_VIEW: "communities.view",
  COMMUNITIES_CREATE: "communities.create",
  COMMUNITIES_MANAGE: "communities.manage",
  COMMUNITIES_APPROVE_MEMBERS: "communities.approve_members",

  // CMS
  CMS_MANAGE_PAGES: "cms.manage_pages",
  CMS_MANAGE_BLOGS: "cms.manage_blogs",
  CMS_MANAGE_FAQS: "cms.manage_faqs",
  CMS_MANAGE_SUCCESS_STORIES: "cms.manage_success_stories",
  CMS_MANAGE_SEO: "cms.manage_seo",

  // Matches
  MATCHES_VIEW: "matches.view",
  MATCHES_MANAGE: "matches.manage",
  MATCHES_ARRANGE_MEETING: "matches.arrange_meeting",

  // Analytics
  ANALYTICS_VIEW_DASHBOARD: "analytics.view_dashboard",
  ANALYTICS_EXPORT_REPORTS: "analytics.export_reports",

  // Notifications
  NOTIFICATIONS_SEND: "notifications.send",
  NOTIFICATIONS_MANAGE_TEMPLATES: "notifications.manage_templates",

  // Audit & System
  AUDIT_VIEW_LOGS: "audit.view_logs",
  SETTINGS_MANAGE_ROLES: "settings.manage_roles",
  SETTINGS_SYSTEM_CONFIG: "settings.system_config",
  SETTINGS_FIELD_VISIBILITY: "settings.field_visibility",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_MODULES: Record<string, { label: string; permissions: Permission[] }> = {
  users: {
    label: "User Management",
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_APPROVE,
      PERMISSIONS.USERS_SUSPEND,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_EDIT,
    ],
  },
  kyc: {
    label: "KYC Management",
    permissions: [PERMISSIONS.KYC_VIEW, PERMISSIONS.KYC_APPROVE, PERMISSIONS.KYC_REJECT],
  },
  images: {
    label: "Image Moderation",
    permissions: [PERMISSIONS.IMAGES_VIEW, PERMISSIONS.IMAGES_APPROVE, PERMISSIONS.IMAGES_REJECT],
  },
  subscriptions: {
    label: "Subscription Management",
    permissions: [
      PERMISSIONS.SUBSCRIPTIONS_VIEW,
      PERMISSIONS.SUBSCRIPTIONS_MANAGE_PLANS,
      PERMISSIONS.SUBSCRIPTIONS_MANAGE_COUPONS,
      PERMISSIONS.SUBSCRIPTIONS_OVERRIDE,
    ],
  },
  payments: {
    label: "Payment Management",
    permissions: [PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_REFUND, PERMISSIONS.PAYMENTS_EXPORT],
  },
  communities: {
    label: "Community Management",
    permissions: [
      PERMISSIONS.COMMUNITIES_VIEW,
      PERMISSIONS.COMMUNITIES_CREATE,
      PERMISSIONS.COMMUNITIES_MANAGE,
      PERMISSIONS.COMMUNITIES_APPROVE_MEMBERS,
    ],
  },
  cms: {
    label: "CMS Management",
    permissions: [
      PERMISSIONS.CMS_MANAGE_PAGES,
      PERMISSIONS.CMS_MANAGE_BLOGS,
      PERMISSIONS.CMS_MANAGE_FAQS,
      PERMISSIONS.CMS_MANAGE_SUCCESS_STORIES,
      PERMISSIONS.CMS_MANAGE_SEO,
    ],
  },
  matches: {
    label: "Communication & Matching",
    permissions: [PERMISSIONS.MATCHES_VIEW, PERMISSIONS.MATCHES_MANAGE, PERMISSIONS.MATCHES_ARRANGE_MEETING],
  },
  analytics: {
    label: "Reports & Analytics",
    permissions: [PERMISSIONS.ANALYTICS_VIEW_DASHBOARD, PERMISSIONS.ANALYTICS_EXPORT_REPORTS],
  },
  notifications: {
    label: "Notifications",
    permissions: [PERMISSIONS.NOTIFICATIONS_SEND, PERMISSIONS.NOTIFICATIONS_MANAGE_TEMPLATES],
  },
  system: {
    label: "Audit & System",
    permissions: [
      PERMISSIONS.AUDIT_VIEW_LOGS,
      PERMISSIONS.SETTINGS_MANAGE_ROLES,
      PERMISSIONS.SETTINGS_SYSTEM_CONFIG,
      PERMISSIONS.SETTINGS_FIELD_VISIBILITY,
    ],
  },
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  "Super Admin": Object.values(PERMISSIONS),
  Admin: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.SETTINGS_MANAGE_ROLES),
  Moderator: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_APPROVE,
    PERMISSIONS.KYC_VIEW,
    PERMISSIONS.KYC_APPROVE,
    PERMISSIONS.KYC_REJECT,
    PERMISSIONS.IMAGES_VIEW,
    PERMISSIONS.IMAGES_APPROVE,
    PERMISSIONS.IMAGES_REJECT,
    PERMISSIONS.COMMUNITIES_APPROVE_MEMBERS,
  ],
  "Subscription Manager": [
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE_PLANS,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE_COUPONS,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.ANALYTICS_VIEW_DASHBOARD,
  ],
  "CMS Manager": [
    PERMISSIONS.CMS_MANAGE_PAGES,
    PERMISSIONS.CMS_MANAGE_BLOGS,
    PERMISSIONS.CMS_MANAGE_FAQS,
    PERMISSIONS.CMS_MANAGE_SUCCESS_STORIES,
    PERMISSIONS.CMS_MANAGE_SEO,
  ],
  "Support Executive": [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
  ],
  "Community Manager": [
    PERMISSIONS.COMMUNITIES_VIEW,
    PERMISSIONS.COMMUNITIES_MANAGE,
  ],
};
