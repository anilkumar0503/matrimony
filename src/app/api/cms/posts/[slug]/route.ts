import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await prisma.blog.findUnique({ where: { slug } });
    if (!post) return apiError("Post not found", 404);
    if (post.status !== "PUBLISHED") return apiError("Post not available", 403);
    return apiResponse({ post: { ...post, author: { name: post.author || "Admin" }, coverImageUrl: post.featuredImage, seoTitle: post.metaTitle, seoDescription: post.metaDesc } });
  } catch (err) {
    return handleApiError(err);
  }
}

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().nullable().or(z.literal("")),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDesc: z.string().max(160).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin(req);
    const { slug } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) return apiError("Post not found", 404);

    const data: Record<string, unknown> = { ...parsed.data };

    if (data.title && data.title !== existing.title) {
      let newSlug = slugify(data.title as string);
      const slugConflict = await prisma.blog.findUnique({ where: { slug: newSlug } });
      if (slugConflict && slugConflict.id !== existing.id) newSlug = `${newSlug}-${Date.now()}`;
      data.slug = newSlug;
    }
    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") data.publishedAt = new Date();

    const post = await prisma.blog.update({ where: { id: existing.id }, data });
    return apiResponse({ post });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin(req);
    const { slug } = await params;
    const post = await prisma.blog.findUnique({ where: { slug } });
    if (!post) return apiError("Post not found", 404);
    await prisma.blog.delete({ where: { id: post.id } });
    return apiResponse({ message: "Post deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
