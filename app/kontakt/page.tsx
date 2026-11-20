import type { Metadata } from "next"

import KontaktFormular from "@/components/web/KontaktFormular"
import Mapa from "@/components/web/Mapa"
import JsonLd from "@/components/web/JsonLd"
import { Nadpis, Ramec } from "@/components/web/Ramec"
import { FIRMA, OTEVIRACI_DOBA } from "@/lib/firma"
import { pageSeo, strankaLd } from "@/lib/seo"

const SEO = {
    title: "Kontakt",
    description: "Prodej a servis Toyota Vysočina.cz, Rantířovská 4844/6, Jihlava. Napište nám nebo se zastavte v showroomu.",
    path: "/kontakt",
}
export const metadata: Metadata = pageSeo(SEO)

const tel = (t: string) => `tel:${t.replace(/\s/g, "")}`

// Stránka Kontakt (Figma 189:1230 desktop / 189:1330 mobil)
export default function Page() {
    const udaje: [string, React.ReactNode][] = [
        ["Adresa", <span key="a">{FIRMA.ulice}<br />{FIRMA.mesto}</span>],
        ["Prodej vozů", <a key="p" href={tel(FIRMA.telefonProdej)}>{FIRMA.telefonProdej}</a>],
        ["Servis", <a key="s" href={tel(FIRMA.telefonServis)}>{FIRMA.telefonServis}</a>],
        ["E-mail", <a key="e" href={`mailto:${FIRMA.email}`}>{FIRMA.email}</a>],
        ["Otevírací doba", OTEVIRACI_DOBA.map((r) => <span key={r} className="block">{r}</span>)],
    ]
    return (
        <Ramec aktivni="/kontakt">
            <JsonLd uzly={strankaLd({ typ: "ContactPage", cesta: SEO.path, nazev: SEO.title, popis: SEO.description })} />
            <div className="grid gap-9 px-4 pb-8 pt-7 md:grid-cols-2 md:gap-16 md:px-16 md:pb-16 md:pt-[72px]">
                <section className="flex flex-col gap-4 md:gap-6">
                    <Nadpis stitek={FIRMA.znacka} className="text-[44px] md:text-[72px]">
                        Kontakt
                    </Nadpis>
                    <p className="text-[17px] leading-[1.45] md:text-xl">
                        Máte dotaz k vozu, testovací jízdě nebo servisu? Napište nám nebo se zastavte v showroomu. Odpovídáme do jednoho pracovního dne.
                    </p>
                    <dl className="border-t-[1.5px] border-ink">
                        {udaje.map(([k, v]) => (
                            <div key={k} className="flex flex-col gap-1 border-b border-hair py-3.5 md:flex-row md:gap-0">
                                <dt className="w-[150px] shrink-0 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2 md:pt-1">{k}</dt>
                                <dd className="font-body text-[17px] font-bold leading-[1.45] md:text-lg">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
                <KontaktFormular />
            </div>
            <section className="flex flex-col gap-4 px-4 pb-10 md:px-16 md:pb-24">
                <h2 className="font-display text-[22px] font-extrabold uppercase tracking-[-0.02em] md:text-[26px]">Jak k nám</h2>
                <Mapa />
            </section>
        </Ramec>
    )
}
