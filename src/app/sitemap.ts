import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jasminematrimony.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/plans`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/success-stories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/communities`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const [profiles, communities, blogs] = await Promise.all([
      prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, updatedAt: true },
        take: 1000,
      }),
      prisma.community.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blog.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const profilePages: MetadataRoute.Sitemap = profiles.map((p: { id: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/profile/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const communityPages: MetadataRoute.Sitemap = communities.map((c: { slug: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/community/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const blogPages: MetadataRoute.Sitemap = blogs.map((b: { slug: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...staticPages, ...profilePages, ...communityPages, ...blogPages];
  } catch {
    return staticPages;
  }
}
