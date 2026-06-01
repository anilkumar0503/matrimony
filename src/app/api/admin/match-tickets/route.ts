import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { sendNotification, NOTIFICATION_EVENTS } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, [PERMISSIONS.MATCHES_VIEW]);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      prisma.matchTicket.findMany({
        where,
        include: {
          match: {
            include: {
              userA: { include: { profile: { select: { fullName: true, city: true } } } },
              userB: { include: { profile: { select: { fullName: true, city: true } } } },
            },
          },
          notes: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.matchTicket.count({ where }),
    ]);

    return apiResponse({ tickets, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return handleApiError(err);
  }
}

const updateSchema = z.object({
  ticketId: z.string(),
  action: z.enum(["START_REVIEW", "SCHEDULE_MEETING", "COMPLETE", "CLOSE", "ADD_NOTE"]),
  meetingLink: z.string().url().optional(),
  meetingTime: z.string().optional(),
  meetingType: z.enum(["GOOGLE_MEET", "PHYSICAL", "OFFLINE_ASSISTED"]).optional(),
  outcome: z.enum(["PROCEEDING", "NOT_PROCEEDING", "ENGAGED", "MARRIED"]).optional(),
  closeReason: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req, [PERMISSIONS.MATCHES_MANAGE]);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { ticketId, action, meetingLink, meetingTime, meetingType, outcome, closeReason, note } = parsed.data;

    const ticket = await prisma.matchTicket.findUnique({
      where: { id: ticketId },
      include: { match: true },
    });
    if (!ticket) return apiError("Ticket not found", 404);

    let update: Record<string, unknown> = {};
    let newStatus = ticket.status;

    switch (action) {
      case "START_REVIEW":
        newStatus = "IN_REVIEW";
        update = { status: newStatus, assignedTo: admin.id };
        break;
      case "SCHEDULE_MEETING":
        if (!meetingLink && !meetingType) return apiError("Meeting details required", 400);
        newStatus = "SCHEDULED";
        update = {
          status: newStatus,
          meetingLink,
          meetingTime: meetingTime ? new Date(meetingTime) : undefined,
          meetingType,
        };
        await sendNotification({
          userId: ticket.match.userAId,
          event: NOTIFICATION_EVENTS.MEETING_SCHEDULED,
          variables: {
            user_name: "",
            meeting_date: meetingTime || "",
            meeting_link: meetingLink || "",
          },
        });
        await sendNotification({
          userId: ticket.match.userBId,
          event: NOTIFICATION_EVENTS.MEETING_SCHEDULED,
          variables: {
            user_name: "",
            meeting_date: meetingTime || "",
            meeting_link: meetingLink || "",
          },
        });
        break;
      case "COMPLETE":
        newStatus = "COMPLETED";
        update = { status: newStatus, outcome };
        break;
      case "CLOSE":
        newStatus = "CLOSED";
        update = { status: newStatus, closeReason, outcome };
        break;
      case "ADD_NOTE":
        if (!note) return apiError("Note content required", 400);
        await prisma.matchTicketNote.create({
          data: { ticketId, adminId: admin.id, note },
        });
        return apiResponse({ message: "Note added." });
    }

    await prisma.matchTicket.update({ where: { id: ticketId }, data: update });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "MATCH_TICKET_UPDATED",
        targetType: "MatchTicket",
        targetId: ticketId,
        details: { action, newStatus },
      },
    });

    return apiResponse({ message: `Ticket updated: ${action}`, status: newStatus });
  } catch (err) {
    return handleApiError(err);
  }
}
