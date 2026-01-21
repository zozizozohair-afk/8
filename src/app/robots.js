import { MetadataRoute } from "next";

const baseUrl = "https://safwat-anan.sa";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

