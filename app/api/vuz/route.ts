import { nactiVuz } from "@/sanity/lib/nabidka"

// Detail vozu pro auto na koberci (VUZ_QUERY): GET /api/vuz?slug=rav4-style
export async function GET(request: Request) {
    const slug = new URL(request.url).searchParams.get("slug")
    if (!slug) return Response.json({ error: "Chybí slug" }, { status: 400 })
    const vuz = await nactiVuz(slug)
    if (!vuz) return Response.json({ error: "Vůz nenalezen" }, { status: 404 })
    return Response.json(vuz)
}
