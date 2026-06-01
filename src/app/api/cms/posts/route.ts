import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, apiResponse, apiError, handleApiError } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || "PUBLISHED";
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    const where: Record<string, unknown> = { status };
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };

    const [posts, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        select: {
          id: true, title: true, slug: true, status: true, category: true,
          excerpt: true, featuredImage: true, tags: true, metaTitle: true,
          publishedAt: true, createdAt: true, author: true,
        },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.blog.count({ where }),
    ]);

    const mapped = posts.map((p: typeof posts[number]) => ({ ...p, coverImageUrl: p.featuredImage, author: { name: p.author || "Admin" }, seoTitle: p.metaTitle, viewCount: 0 }));
    return apiResponse({ posts: mapped, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return handleApiError(err);
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  metaTitle: z.string().max(70).optional(),
  metaDesc: z.string().max(160).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdmin(req);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { title, content, excerpt, featuredImage, category, tags, status, metaTitle, metaDesc } = parsed.data;

    let slug = slugify(title);
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await prisma.blog.create({
      data: {
        title, content, excerpt, featuredImage: featuredImage || null,
        category, tags: tags || [], status, slug,
        author: admin.name, metaTitle, metaDesc,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        createdBy: admin.id,
      },
    });

    return apiResponse({ post }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
