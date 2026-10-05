import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/election/",
          "/admin/",
          "/dashboard/",
          "/private/",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://visionspeaks.com/sitemap.xml",
  };
}
