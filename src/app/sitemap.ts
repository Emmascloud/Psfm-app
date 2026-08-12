import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psmf-app.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/rules`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
