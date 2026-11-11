import { cacheLife, cacheTag } from "next/cache"

import { client } from "./client"
import { MODELY_QUERY, VARIANTA_FOTKY_QUERY, VOZY_QUERY, VUZ_QUERY } from "./queries"

// Všechna data nabídky nesou jeden tag: obsahu je málo a změna vozu se promítá i do mřížky modelů.
// Cache se drží „max“ (Next se sám ozve nejdřív po 30 dnech), jinak ji zneplatní jen webhook
// ze Sanity (app/api/revalidate) → při běžném provozu se do Sanity skoro nechodí.
export const TAG_NABIDKA = "nabidka"

// Celá nabídka pro panel „Nabídka vozů“: mřížky modelů pro všechny tři kategorie a karty vozů
// (verze modelu se z nich filtrují na klientu). Dat je málo, takže jdou se stránkou najednou.
export async function nactiNabidku() {
    "use cache"
    cacheLife("max")
    cacheTag(TAG_NABIDKA)
    const [modely, skladove, predvadeci, vozy] = await Promise.all([
        client.fetch(MODELY_QUERY, { kategorie: "modely" }),
        client.fetch(MODELY_QUERY, { kategorie: "skladove" }),
        client.fetch(MODELY_QUERY, { kategorie: "predvadeci" }),
        client.fetch(VOZY_QUERY),
    ])
    return { modely: { modely, skladove, predvadeci }, vozy }
}
export type Nabidka = Awaited<ReturnType<typeof nactiNabidku>>

export async function nactiVuz(slug: string) {
    "use cache"
    cacheLife("max")
    cacheTag(TAG_NABIDKA)
    return client.fetch(VUZ_QUERY, { slug })
}

export async function nactiFotky(slug: string, variantaKey: string) {
    "use cache"
    cacheLife("max")
    cacheTag(TAG_NABIDKA)
    return client.fetch(VARIANTA_FOTKY_QUERY, { slug, variantaKey })
}
