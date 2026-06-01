import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";
import { getSignedDownloadUrl } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.KYC_VIEW]);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || "PENDING";

    const slaHours = 24;
    const slaThreshold = new Date(Date.now() - slaHours * 60 * 60 * 1000);

    const [submissions, total] = await Promise.all([
      prisma.kYCSubmission.findMany({
        where: { status },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              gender: true,
              dateOfBirth: true,
              profile: { select: { fullName: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.kYCSubmission.count({ where: { status } }),
    ]);

    const submissionsWithSla = submissions.map((s) => ({
      ...s,
      isSlaBreach: s.createdAt < slaThreshold && s.status === "PENDING",
    }));

    return apiResponse({
      submissions: submissionsWithSla,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

const reviewSchema = z.object({
  submissionId: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z
    .enum(["CODE_NOT_VISIBLE", "ID_UNCLEAR", "FACE_MISMATCH", "SUSPICIOUS", "EXPIRED_DOCUMENT"])
    .optional(),
  rejectionNotes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.KYC_APPROVE]);
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { submissionId, action, rejectionReason, rejectionNotes } = parsed.data;

    if (action === "REJECT" && !rejectionReason) {
      return apiError("Rejection reason is required", 400);
    }

    const submission = await prisma.kYCSubmission.findUnique({
      where: { id: submissionId },
      include: { user: true },
    });
    if (!submission) return apiError("KYC submission not found", 404);

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    await prisma.kYCSubmission.update({
      where: { id: submissionId },
      data: {
        status: newStatus,
        rejectionReason,
        rejectionNotes,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    });

    if (action === "APPROVE") {
      await prisma.user.update({
        where: { id: submission.userId },
        data: { status: "PENDING_APPROVAL" },
      });
      await sendNotification({
        userId: submission.userId,
        event: NOTIFICATION_EVENTS.KYC_APPROVED,
        variables: { user_name: submission.user.email },
      });
    } else {
      await sendNotification({
        userId: submission.userId,
        event: NOTIFICATION_EVENTS.KYC_REJECTED,
        variables: {
          user_name: submission.user.email,
          reason: rejectionReason?.replace(/_/g, " ") || "Unknown reason",
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: action === "APPROVE" ? "KYC_APPROVED" : "KYC_REJECTED",
        targetType: "KYCSubmission",
        targetId: submissionId,
        details: { reason: rejectionReason, notes: rejectionNotes },
      },
    });

    return apiResponse({ message: `KYC ${action.toLowerCase()}d successfully.` });
  } catch (err) {
    return handleApiError(err);
  }
}
