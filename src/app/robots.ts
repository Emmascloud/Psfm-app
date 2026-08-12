import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psmf-app.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/rules", "/login", "/signup", "/forgot-password"],
      disallow: ["/dashboard", "/admin", "/reset-password", "/auth"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
