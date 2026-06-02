import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thegoldenmic.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL,                         lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/booking`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/bulk-booking`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/auth/login`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
