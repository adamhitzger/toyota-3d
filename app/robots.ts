import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
    return {
        // Sanity Studio a API (formuláře, revalidace) do vyhledávání nepatří
        rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
