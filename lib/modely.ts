import { cena, pohony, pohonyVozu } from "@/components/nabidka/texty"
import { FIRMA } from "@/lib/firma"
import { ID, url } from "@/lib/seo"
import { urlFor } from "@/sanity/lib/image"
import type { ModelSVozy } from "@/sanity/lib/nabidka"

// Texty a schema.org stránek modelů. Vše jen z dat v Sanity, nic se nedopisuje.
export const cestaModelu = (slug: string) => `/modely/${slug}`
export const cenaOd = (m: ModelSVozy) => Math.min(...m.vozy.map((v) => v.cenaOd))
export const pohonyModelu = (m: ModelSVozy) => pohony([...new Set(m.vozy.flatMap(pohonyVozu))])
export const barvyModelu = (m: ModelSVozy) => [...new Set(m.vozy.flatMap((v) => v.barvy.map((b) => b.nazevBarvy)))]
export const verzeModelu = (m: ModelSVozy) => [...new Set(m.vozy.map((v) => v.verze ?? v.nazev))]

export const popisModelu = (m: ModelSVozy) =>
    `Toyota ${m.nazev} od ${cena(cenaOd(m))} vč. DPH. Pohon: ${pohonyModelu(m).toLowerCase()}. Verze ${verzeModelu(m).join(", ")}, ceny a barvy v showroomu ${FIRMA.znacka} v Jihlavě.`

export function otazkyModelu(m: ModelSVozy): [string, string][] {
    const t = `Toyota ${m.nazev}`
    return [
        [`Kolik stojí ${t}?`, `${t} stojí od ${cena(cenaOd(m))} včetně DPH. ${m.vozy.map((v) => `${v.nazev} od ${cena(v.cenaOd)}`).join(", ")}.`],
        [`Jaký pohon má ${t}?`, `${pohonyModelu(m)}.`],
        [`V jakých barvách je ${t} v nabídce?`, `${barvyModelu(m).join(", ")}. Výběr barev se u jednotlivých verzí liší.`],
        [`Kde si ${t} prohlédnout a poptat?`, `Online v 3D showroomu nebo osobně v ${FIRMA.znacka}, ${FIRMA.ulice}, ${FIRMA.mesto}. Prodej: ${FIRMA.telefonProdej}.`],
    ]
}

export const fotkaModelu = (m: ModelSVozy) => (m.vozy[0].foto ? urlFor(m.vozy[0].foto).width(1200).height(630).fit("fill").bg("ECECEA").format("jpg").url() : undefined)

// Řada vozů s cenami od–do; jednotlivé verze jsou nabídky. Dostupnost se neuvádí, v datech není.
export function modelLd(m: ModelSVozy) {
    const adresa = url(cestaModelu(m.slug))
    const foto = fotkaModelu(m)
    return {
        "@type": ["Product", "Car"],
        "@id": `${adresa}#vuz`,
        name: `Toyota ${m.nazev}`,
        description: popisModelu(m),
        url: adresa,
        ...(foto && { image: foto }),
        brand: { "@type": "Brand", name: "Toyota" },
        manufacturer: { "@type": "Organization", name: "Toyota" },
        model: m.nazev,
        color: barvyModelu(m),
        fuelType: pohonyModelu(m),
        mainEntityOfPage: { "@id": ID.stranka(cestaModelu(m.slug)) },
        offers: {
            "@type": "AggregateOffer",
            priceCurrency: "CZK",
            lowPrice: cenaOd(m),
            highPrice: Math.max(...m.vozy.map((v) => v.cenaOd)),
            offerCount: m.vozy.length,
            seller: { "@id": ID.firma },
            offers: m.vozy.map((v) => ({
                "@type": "Offer",
                name: `Toyota ${v.nazev}`,
                price: v.cenaOd,
                priceCurrency: "CZK",
                priceSpecification: { "@type": "PriceSpecification", minPrice: v.cenaOd, priceCurrency: "CZK", valueAddedTaxIncluded: true },
                url: adresa,
                seller: { "@id": ID.firma },
            })),
        },
    }
}

export const faqLd = (cesta: string, otazky: [string, string][]) => ({
    "@type": "FAQPage",
    "@id": `${url(cesta)}#otazky`,
    isPartOf: { "@id": ID.stranka(cesta) },
    mainEntity: otazky.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
})
