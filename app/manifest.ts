import type { MetadataRoute } from "next"

import { FIRMA } from "@/lib/firma"
import { NAZEV_WEBU, POPIS_WEBU } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: NAZEV_WEBU,
        short_name: FIRMA.znacka,
        description: POPIS_WEBU,
        lang: "cs",
        start_url: "/",
        display: "standalone",
        background_color: "#0F0F10",
        theme_color: "#0F0F10",
        icons: [
            { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
            { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
            { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
        ],
    }
}
