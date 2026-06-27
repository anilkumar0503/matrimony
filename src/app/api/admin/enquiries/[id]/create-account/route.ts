import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });
    if (!enquiry) return apiError("Enquiry not found", 404);
    if (enquiry.userId) return apiError("Account already created for this enquiry", 400);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { password, gender, dateOfBirth } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: enquiry.email },
    });
    if (existingUser) return apiError("Email already registered", 400);

    const passwordHash = await bcrypt.hash(password, 12);

    const userData: any = {
      email: enquiry.email,
      passwordHash,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      status: "PENDING_VERIFICATION",
      emailVerified: false,
    };

    if (enquiry.phone) {
      userData.phone = enquiry.phone;
    }

    const user = await prisma.user.create({
      data: userData,
    });

    // Create empty profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        profileCompletionPct: 0,
      },
    });

    // Link enquiry to user
    await prisma.enquiry.update({
      where: { id },
      data: { userId: user.id, status: "CONVERTED" },
    });

    return apiResponse({
      user: { id: user.id, email: user.email },
      message: "Account created successfully",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
