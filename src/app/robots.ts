import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jasminematrimony.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/profile/", "/blog/", "/community/", "/about", "/how-it-works", "/plans", "/faq", "/contact", "/success-stories", "/communities"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/_next/", "/login", "/register", "/forgot-password"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
