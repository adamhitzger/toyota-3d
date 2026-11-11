import { nactiFotky } from "@/sanity/lib/nabidka"

// Zbývající fotky jedné barevné varianty (VARIANTA_FOTKY_QUERY), volá se až při prvním otočení:
// GET /api/fotky?slug=rav4-style&varianta=<_key>
export async function GET(request: Request) {
    const params = new URL(request.url).searchParams
    const slug = params.get("slug")
    const varianta = params.get("varianta")
    if (!slug || !varianta) return Response.json({ error: "Chybí slug nebo varianta" }, { status: 400 })
    return Response.json((await nactiFotky(slug, varianta)) ?? [])
}
