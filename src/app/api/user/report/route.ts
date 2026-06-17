import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser, apiResponse, apiError, handleApiError } from "@/lib/auth";

const reportSchema = z.object({
  profileId: z.string(),
  reason: z.string().min(5).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { profileId, reason } = parsed.data;

    // Check if profile exists
    const profile = await prisma.user.findUnique({
      where: { id: profileId },
    });
    if (!profile) return apiError("Profile not found", 404);

    // Don't allow self-reporting
    if (profileId === user.id) return apiError("Cannot report your own profile", 400);

    // Check if already reported
    const existing = await prisma.profileReport.findFirst({
      where: { reporterId: user.id, reportedUserId: profileId },
    });
    if (existing) return apiError("You have already reported this profile", 400);

    // Create report
    await prisma.profileReport.create({
      data: {
        reporterId: user.id,
        reportedUserId: profileId,
        reason,
        status: "PENDING",
      },
    });

    return apiResponse({ message: "Report submitted successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
