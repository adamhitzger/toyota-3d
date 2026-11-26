import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { cena, nazevKategorie, pohony, pohonyVozu } from "@/components/nabidka/texty"
import { Vzorky } from "@/components/nabidka/SeznamVozu"
import { Foto, ZpetObsah, zpet } from "@/components/nabidka/ui"
import JsonLd from "@/components/web/JsonLd"
import { Nadpis, Ramec } from "@/components/web/Ramec"
import { cenaOd, cestaModelu, faqLd, fotkaModelu, modelLd, otazkyModelu, pohonyModelu, popisModelu } from "@/lib/modely"
import { OG_OBRAZEK, pageSeo, strankaLd } from "@/lib/seo"
import { nactiModely } from "@/sanity/lib/nabidka"

type Props = { params: Promise<{ slug: string }> }

// Stránky jsou předem vygenerované celé (generateStaticParams). Suspense kvůli okamžité navigaci by
// u neznámého modelu poslal 200 místo 404, takže se na obsah čeká.
export const instant = false

export async function generateStaticParams() {
    return (await nactiModely()).map((m) => ({ slug: m.slug }))
}

const najdi = async (params: Props["params"]) => {
    const { slug } = await params
    return (await nactiModely()).find((m) => m.slug === slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const m = await najdi(params)
    if (!m) notFound()
    const foto = fotkaModelu(m)
    return pageSeo({
        title: `Toyota ${m.nazev}: cena, verze a barvy`,
        description: popisModelu(m),
        path: cestaModelu(m.slug),
        obrazek: foto ? { ...OG_OBRAZEK, url: foto, alt: `Toyota ${m.nazev}` } : OG_OBRAZEK,
    })
}

export default async function Page({ params }: Props) {
    const m = await najdi(params)
    if (!m) notFound()
    const cesta = cestaModelu(m.slug)
    const otazky = otazkyModelu(m)
    return (
        <Ramec aktivni="/modely">
            <JsonLd
                uzly={[
                    ...strankaLd({ cesta, nazev: `Toyota ${m.nazev}`, popis: popisModelu(m), nadrazena: { nazev: "Modely a ceny", cesta: "/modely" } }),
                    modelLd(m),
                    faqLd(cesta, otazky),
                ]}
            />
            <div className="flex flex-col gap-9 px-4 pb-10 pt-7 md:gap-16 md:px-16 md:pb-24 md:pt-[72px]">
                <div className="flex flex-col gap-4 md:gap-6">
                    <Link href="/modely" className={`group ${zpet}`}>
                        <ZpetObsah>Modely a ceny</ZpetObsah>
                    </Link>
                    <Nadpis stitek={pohonyModelu(m)} className="text-[44px] md:text-[72px]">
                        Toyota {m.nazev}
                    </Nadpis>
                    <p className="text-[17px] font-bold md:text-xl">od {cena(cenaOd(m))} včetně DPH</p>
                </div>

                <section className="flex flex-col gap-4 md:gap-6">
                    <h2 className="font-display text-[22px] font-extrabold uppercase tracking-[-0.02em] md:text-[26px]">Verze a ceny</h2>
                    <ul className="grid gap-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                        {m.vozy.map((v) => (
                            <li key={v._id} className="flex flex-col gap-3.5 border border-ink bg-panel p-4 md:p-6">
                                <span className="w-fit border border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em]">
                                    {pohony(pohonyVozu(v))}
                                    {v.kategorie !== "modely" && ` · ${nazevKategorie(v.kategorie)}`}
                                </span>
                                <h3 className="font-display text-[26px] font-extrabold leading-none tracking-[-0.02em]">{v.nazev}</h3>
                                <Foto foto={v.foto} width={373} alt={`Toyota ${v.nazev}, ${v.barvy[0]?.nazevBarvy ?? ""}`} className="h-[150px] w-full" />
                                <Vzorky barvy={v.barvy} velikost="size-5" mezera="gap-1.5" />
                                <p className="text-[15px] leading-[1.45] text-ink-2">{[...new Set(v.barvy.map((b) => b.nazevBarvy))].join(", ")}</p>
                                <p className="mt-auto font-display text-2xl font-black tracking-[-0.02em]">od {cena(v.cenaOd)}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <Link href="/kontakt" className="flex h-14 items-center justify-center bg-ink px-6 font-mono text-[15px] uppercase tracking-[0.08em] text-on-ink">
                            Zeptat se na vůz →
                        </Link>
                        <Link href="/" className="flex h-14 items-center justify-center border border-ink bg-panel px-6 font-mono text-[15px] uppercase tracking-[0.08em]">
                            Otevřít showroom
                        </Link>
                    </div>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="font-display text-[22px] font-extrabold uppercase tracking-[-0.02em] md:text-[26px]">Časté otázky</h2>
                    <dl className="max-w-[860px] border-t-[1.5px] border-ink">
                        {otazky.map(([q, a]) => (
                            <div key={q} className="flex flex-col gap-1.5 border-b border-hair py-4">
                                <dt className="text-lg font-bold">{q}</dt>
                                <dd className="text-[17px] leading-[1.5]">{a}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>
        </Ramec>
    )
}
