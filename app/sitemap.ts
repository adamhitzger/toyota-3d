import type { MetadataRoute } from "next"

import { cestaModelu } from "@/lib/modely"
import { url } from "@/lib/seo"
import { nactiModely } from "@/sanity/lib/nabidka"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const modely = await nactiModely()
    return [
        { url: url("/") },
        { url: url("/modely") },
        ...modely.map((m) => ({ url: url(cestaModelu(m.slug)) })),
        { url: url("/kontakt") },
        { url: url("/zpracovani-osobnich-udaju") },
    ]
}
