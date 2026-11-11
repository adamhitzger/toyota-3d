import { revalidateTag } from "next/cache"
import { type NextRequest } from "next/server"
import { parseBody } from "next-sanity/webhook"

import { TAG_NABIDKA } from "@/sanity/lib/nabidka"

// Webhook ze Sanity (GROQ-powered webhook, POST): po vytvoření, úpravě nebo smazání vozu či modelu
// zneplatní cache nabídky. Podpis ověřuje SANITY_REVALIDATE_SECRET (stejný secret jako ve webhooku).
// Projekce webhooku stačí {_id, _type}.
const TYPY = ["vuz", "model"]

export async function POST(req: NextRequest) {
    const secret = process.env.SANITY_REVALIDATE_SECRET
    if (!secret) return Response.json({ error: "Chybí SANITY_REVALIDATE_SECRET" }, { status: 500 })

    // true = počká, než je změna v Content Lake dostupná, aby se nenačetla stará data
    const { isValidSignature, body } = await parseBody<{ _id?: string; _type?: string }>(req, secret, true)
    if (!isValidSignature) return Response.json({ error: "Neplatný podpis" }, { status: 401 })
    if (!body?._type) return Response.json({ error: "Chybí _type" }, { status: 400 })
    if (!TYPY.includes(body._type)) return Response.json({ revalidated: false, reason: `typ ${body._type} se nesleduje` })

    // expire 0: další požadavek už počká na čerstvá data, ne stale-while-revalidate
    revalidateTag(TAG_NABIDKA, { expire: 0 })
    return Response.json({ revalidated: true, tag: TAG_NABIDKA, id: body._id })
}
