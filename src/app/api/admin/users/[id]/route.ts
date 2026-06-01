import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";

const actionSchema = z.object({
  action: z.enum(["APPROVE", "SUSPEND", "DELETE", "REACTIVATE", "FORCE_LOGOUT"]),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req, [PERMISSIONS.USERS_VIEW]);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: { include: { partnerPreferences: true } },
        kycSubmissions: { orderBy: { createdAt: "desc" } },
        images: { orderBy: { sortOrder: "asc" } },
        subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
        communityMembers: { include: { community: true } },
        consentRecords: { orderBy: { createdAt: "desc" }, take: 20 },
        sessions: { where: { revokedAt: null }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) return apiError("User not found", 404);
    return apiResponse({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.USERS_APPROVE]);
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { action, reason } = parsed.data;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("User not found", 404);

    let newStatus = user.status;
    let auditAction: "USER_APPROVED" | "USER_SUSPENDED" | "USER_DELETED" | "FORCE_LOGOUT";
    let notifEvent: string | null = null;

    switch (action) {
      case "APPROVE":
        newStatus = "ACTIVE";
        auditAction = "USER_APPROVED";
        notifEvent = NOTIFICATION_EVENTS.PROFILE_APPROVED;
        break;
      case "SUSPEND":
        newStatus = "SUSPENDED";
        auditAction = "USER_SUSPENDED";
        notifEvent = NOTIFICATION_EVENTS.PROFILE_REJECTED;
        await prisma.session.updateMany({ where: { userId: id }, data: { revokedAt: new Date() } });
        break;
      case "DELETE":
        newStatus = "DELETED";
        auditAction = "USER_DELETED";
        await prisma.session.updateMany({ where: { userId: id }, data: { revokedAt: new Date() } });
        break;
      case "REACTIVATE":
        newStatus = "ACTIVE";
        auditAction = "USER_APPROVED";
        break;
      case "FORCE_LOGOUT":
        auditAction = "FORCE_LOGOUT";
        await prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
        return apiResponse({ message: "User force-logged out from all sessions." });
    }

    await prisma.user.update({ where: { id }, data: { status: newStatus } });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: auditAction!,
        targetType: "User",
        targetId: id,
        details: { reason, previousStatus: user.status, newStatus },
      },
    });

    if (notifEvent) {
      await sendNotification({
        userId: id,
        event: notifEvent as typeof NOTIFICATION_EVENTS.PROFILE_APPROVED,
        variables: { user_name: user.email, reason: reason || "" },
      });
    }

    return apiResponse({ message: `User ${action.toLowerCase()}d successfully.`, status: newStatus });
  } catch (err) {
    return handleApiError(err);
  }
}
