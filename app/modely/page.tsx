import type { Metadata } from "next"
import Link from "next/link"

import { cena, verze } from "@/components/nabidka/texty"
import { Foto, Sipka } from "@/components/nabidka/ui"
import JsonLd from "@/components/web/JsonLd"
import { Nadpis, Ramec } from "@/components/web/Ramec"
import { FIRMA } from "@/lib/firma"
import { cenaOd, cestaModelu, pohonyModelu } from "@/lib/modely"
import { pageSeo, strankaLd, url } from "@/lib/seo"
import { nactiModely } from "@/sanity/lib/nabidka"

const SEO = {
    title: "Modely a ceny Toyota",
    description: "Přehled modelů Toyota s cenami včetně DPH, pohony a verzemi. Nové vozy v showroomu Toyota Vysočina.cz v Jihlavě.",
    path: "/modely",
}
export const metadata: Metadata = pageSeo(SEO)

// Nabídka z úvodní stránky jako obyčejné odkazy: každý model má vlastní adresu pro vyhledávače i sdílení
export default async function Page() {
    const modely = await nactiModely()
    return (
        <Ramec aktivni={SEO.path}>
            <JsonLd
                uzly={[
                    ...strankaLd({ typ: "CollectionPage", cesta: SEO.path, nazev: SEO.title, popis: SEO.description }),
                    {
                        "@type": "ItemList",
                        "@id": `${url(SEO.path)}#seznam`,
                        itemListElement: modely.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: `Toyota ${m.nazev}`, url: url(cestaModelu(m.slug)) })),
                    },
                ]}
            />
            <div className="flex flex-col gap-7 px-4 pb-10 pt-7 md:gap-12 md:px-16 md:pb-24 md:pt-[72px]">
                <div className="flex flex-col gap-4 md:gap-6">
                    <Nadpis stitek={FIRMA.znacka} className="text-[44px] md:text-[72px]">
                        Modely a ceny
                    </Nadpis>
                    <p className="max-w-[60ch] text-[17px] leading-[1.45] md:text-xl">
                        Modely Toyota, které najdete v našem online showroomu. Ceny jsou uvedené včetně DPH.
                    </p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                    {modely.map((m) => (
                        <li key={m.slug} className="flex">
                            <Link href={cestaModelu(m.slug)} className="group flex w-full flex-col border border-ink bg-panel">
                                <Foto foto={m.vozy[0].foto} width={400} alt={`Toyota ${m.nazev}`} className="h-44 w-full" />
                                <span className="flex flex-1 items-center gap-4 border-t border-ink p-4">
                                    <span className="flex flex-1 flex-col gap-1.5">
                                        <h2 className="font-display text-xl font-extrabold uppercase leading-none tracking-[-0.02em]">{m.nazev}</h2>
                                        <span className="text-[15px] text-ink-2">
                                            {pohonyModelu(m)} · {verze(m.vozy.length)}
                                        </span>
                                        <span className="font-bold">od {cena(cenaOd(m))}</span>
                                    </span>
                                    <Sipka />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </Ramec>
    )
}
