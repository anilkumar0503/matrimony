import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiResponse, apiError, handleApiError } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { name, email, phone, message } = parsed.data;

    const enquiryData: any = { name, email };
    if (phone) enquiryData.phone = phone;
    if (message) enquiryData.message = message;

    const enquiry = await prisma.enquiry.create({
      data: enquiryData,
    });

    return apiResponse({ enquiry }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
