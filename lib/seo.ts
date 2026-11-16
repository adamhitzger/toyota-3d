import type { Metadata } from "next"

import { FIRMA } from "@/lib/firma"

// Veřejná adresa webu (canonical, OG, sitemap, JSON-LD). Na hostingu nastavit NEXT_PUBLIC_SITE_URL,
// výchozí hodnota je předpokládaná doména podle e-mailů v lib/firma.ts.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.toyota-vysocina.cz").replace(/\/$/, "")
export const NAZEV_WEBU = `${FIRMA.znacka} · 3D showroom`
export const POPIS_WEBU =
    "Projděte si showroom Toyota Vysočina v Jihlavě online: nové, skladové i předváděcí vozy Toyota s cenami a poptávkou na jedno kliknutí."

// OG obrázek 1200×630 (public/og.jpg). Stránky s vlastním openGraph ho musí uvést znovu,
// Next z rodiče nedědí jen část objektu.
export const OG_OBRAZEK = { url: "/og.jpg", width: 1200, height: 630, alt: `${FIRMA.znacka} — průlet 3D showroomem` }

export const TITULEK_WEBU = `${FIRMA.znacka} · Toyota showroom v Jihlavě`

// OG/Twitter úvodní stránky (a výchozí pro stránky bez vlastních)
export const OG_WEBU = {
    type: "website",
    locale: "cs_CZ",
    siteName: NAZEV_WEBU,
    title: TITULEK_WEBU,
    description: POPIS_WEBU,
    images: [OG_OBRAZEK],
} satisfies Metadata["openGraph"]

export const url = (cesta: string) => `${SITE_URL}${cesta === "/" ? "" : cesta}`

// Metadata podstránky: titulek, popis, canonical, OG a Twitter se stejným textem
export function pageSeo({ title, description, path }: { title: string; description: string; path: string }): Metadata {
    // title.template z layoutu se na OG/Twitter nepropisuje → celý titulek ručně
    const cely = `${title} · ${FIRMA.znacka}`
    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            locale: "cs_CZ",
            siteName: NAZEV_WEBU,
            url: path,
            title: cely,
            description,
            images: [OG_OBRAZEK],
        },
        twitter: { card: "summary_large_image", title: cely, description, images: [OG_OBRAZEK.url] },
    }
}

// ---------- schema.org (JSON-LD), uzly propojené přes @id ----------

export const ID = {
    firma: `${SITE_URL}/#firma`,
    web: `${SITE_URL}/#web`,
    stranka: (cesta: string) => `${url(cesta)}#stranka`,
}

export const firmaLd = {
    "@type": "AutoDealer",
    "@id": ID.firma,
    name: FIRMA.znacka,
    legalName: FIRMA.obchodniFirma,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}${OG_OBRAZEK.url}`,
    email: FIRMA.email,
    telephone: FIRMA.telefonProdej,
    brand: { "@type": "Brand", name: "Toyota" },
    address: {
        "@type": "PostalAddress",
        streetAddress: FIRMA.ulice,
        postalCode: FIRMA.mesto.slice(0, 6),
        addressLocality: FIRMA.mesto.slice(7),
        addressRegion: "Kraj Vysočina",
        addressCountry: "CZ",
    },
    openingHoursSpecification: FIRMA.hodiny.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.schema,
        opens: h.od,
        closes: h.do,
    })),
    contactPoint: [
        { "@type": "ContactPoint", contactType: "sales", telephone: FIRMA.telefonProdej, email: FIRMA.email, availableLanguage: "cs" },
        { "@type": "ContactPoint", contactType: "customer service", telephone: FIRMA.telefonServis, availableLanguage: "cs" },
    ],
}

export const webLd = {
    "@type": "WebSite",
    "@id": ID.web,
    url: SITE_URL,
    name: NAZEV_WEBU,
    description: POPIS_WEBU,
    inLanguage: "cs-CZ",
    publisher: { "@id": ID.firma },
}

type Stranka = { typ?: string; cesta: string; nazev: string; popis: string; drobecky?: boolean }

// WebPage (+ BreadcrumbList u podstránek) navázaná na web a firmu
export function strankaLd({ typ = "WebPage", cesta, nazev, popis, drobecky = true }: Stranka) {
    const uzly: Record<string, unknown>[] = [
        {
            "@type": typ,
            "@id": ID.stranka(cesta),
            url: url(cesta),
            name: nazev,
            description: popis,
            inLanguage: "cs-CZ",
            isPartOf: { "@id": ID.web },
            about: { "@id": ID.firma },
            primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}${OG_OBRAZEK.url}`, width: 1200, height: 630 },
            ...(drobecky && { breadcrumb: { "@id": `${url(cesta)}#drobecky` } }),
        },
    ]
    if (drobecky)
        uzly.push({
            "@type": "BreadcrumbList",
            "@id": `${url(cesta)}#drobecky`,
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Showroom", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: nazev, item: url(cesta) },
            ],
        })
    return uzly
}
