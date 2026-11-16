import type { MetadataRoute } from "next"

import { url } from "@/lib/seo"

// Web má zatím tři stránky; nabídka vozů žije v panelu na úvodní stránce (bez vlastních URL)
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: url("/"), changeFrequency: "weekly", priority: 1 },
        { url: url("/kontakt"), changeFrequency: "yearly", priority: 0.8 },
        { url: url("/zpracovani-osobnich-udaju"), changeFrequency: "yearly", priority: 0.3 },
    ]
}
