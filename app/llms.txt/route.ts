import { cena } from "@/components/nabidka/texty"
import { ADRESA, FIRMA, OTEVIRACI_DOBA } from "@/lib/firma"
import { cestaModelu, cenaOd, pohonyModelu } from "@/lib/modely"
import { POPIS_WEBU, url } from "@/lib/seo"
import { nactiModely } from "@/sanity/lib/nabidka"

// Stručný přehled webu pro jazykové modely (llmstxt.org), generuje se z dat nabídky
export async function GET() {
    const modely = await nactiModely()
    const text = `# ${FIRMA.znacka}

> ${POPIS_WEBU}

- Provozovatel: ${FIRMA.obchodniFirma}, IČO ${FIRMA.ico}
- Adresa: ${ADRESA}
- Prodej: ${FIRMA.telefonProdej}
- Servis: ${FIRMA.telefonServis}
- E-mail: ${FIRMA.email}
- Otevírací doba prodeje: ${OTEVIRACI_DOBA.join(", ")}

## Modely a ceny (včetně DPH)

${modely.map((m) => `- [Toyota ${m.nazev}](${url(cestaModelu(m.slug))}): od ${cena(cenaOd(m))}, ${pohonyModelu(m).toLowerCase()}. ${m.vozy.map((v) => `${v.nazev} od ${cena(v.cenaOd)}`).join("; ")}`).join("\n")}

## Stránky

- [Showroom](${url("/")}): průlet showroomem a výběr vozu
- [Modely a ceny](${url("/modely")})
- [Kontakt](${url("/kontakt")})
- [Zpracování osobních údajů](${url("/zpracovani-osobnich-udaju")})
`
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
