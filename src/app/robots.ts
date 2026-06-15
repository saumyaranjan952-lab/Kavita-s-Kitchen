import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://kavitaskitchenpuri.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/checkout",
        "/order-confirmation/*",
        "/track-order/*",
        "/profile",
        "/profile/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
