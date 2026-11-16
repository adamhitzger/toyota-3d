import type { Metadata } from "next"
import Link from "next/link"
import { ReactNode } from "react"

import JsonLd from "@/components/web/JsonLd"
import { Nadpis, Ramec } from "@/components/web/Ramec"
import { ADRESA, FIRMA } from "@/lib/firma"
import { pageSeo, strankaLd } from "@/lib/seo"

const SEO = {
    title: "Zpracování osobních údajů",
    description: "Jaké osobní údaje zpracováváme, proč, jak dlouho a jaká máte práva. Hotjar, Meta a Google spouštíme jen s vaším souhlasem.",
    path: "/zpracovani-osobnich-udaju",
}
export const metadata: Metadata = pageSeo(SEO)

// Stránka Zpracování osobních údajů (Figma 190:1230 desktop / 190:1557 mobil).
// Text je návrh — před spuštěním nechat zkontrolovat právníkem a doplnit údaje v lib/firma.ts.
const CASTI = [
    ["spravce", "Kdo vaše údaje zpracovává"],
    ["udaje", "Jaké údaje zpracováváme"],
    ["ucely", "Účely, právní základ a doba uložení"],
    ["nastroje", "Hotjar, Meta a Google"],
    ["cookies", "Cookies"],
    ["prijemci", "Komu údaje předáváme"],
    ["mimo-eu", "Předávání mimo EU"],
    ["prava", "Vaše práva"],
    ["kontakt", "Kontakt pro ochranu údajů"],
] as const

const UCELY = [
    ["Odpověď na dotaz z kontaktního formuláře", "Jednání o smlouvě a oprávněný zájem, čl. 6 odst. 1 písm. b) a f) GDPR", "12 měsíců od vyřízení"],
    ["Poptávka vozu a testovací jízda", "Kroky před uzavřením smlouvy, čl. 6 odst. 1 písm. b) GDPR", "24 měsíců od poptávky"],
    ["Měření návštěvnosti (Google Analytics 4)", "Souhlas, čl. 6 odst. 1 písm. a) GDPR", "14 měsíců"],
    ["Analýza chování na webu (Hotjar)", "Souhlas, čl. 6 odst. 1 písm. a) GDPR", "365 dní"],
    ["Měření reklam a remarketing (Meta, Google Ads)", "Souhlas, čl. 6 odst. 1 písm. a) GDPR", "Do odvolání souhlasu, nejdéle 2 roky"],
    ["Zobrazení mapy (Google Maps)", "Souhlas, čl. 6 odst. 1 písm. a) GDPR", "Podle pravidel Googlu"],
]

const COOKIES = [
    ["cookie_souhlas", "Toyota Vysočina", "Uloží vaši volbu v liště cookies (nezbytná)", "6 měsíců"],
    ["_ga, _ga_*", "Google Analytics", "Rozlišení návštěvníků pro statistiky", "2 roky"],
    ["_gcl_au", "Google Ads", "Měření konverzí z reklam", "90 dní"],
    ["_fbp", "Meta", "Měření reklam a remarketing", "90 dní"],
    ["_hjSessionUser_*", "Hotjar", "Rozpoznání opakované návštěvy", "1 rok"],
    ["_hjSession_*", "Hotjar", "Údaje o aktuální návštěvě", "30 minut"],
]

const NASTROJE: { nazev: string; firma: string; co: [string, string][]; vice: string }[] = [
    {
        nazev: "Hotjar",
        firma: "Hotjar Ltd., Dragonara Business Centre, 5th Floor, Dragonara Road, Paceville, St Julian’s STJ 3141, Malta",
        co: [
            ["Heatmapy", "kam na stránce klikáte a jak daleko scrollujete."],
            ["Záznamy návštěv", "anonymizované záznamy pohybu po webu. Texty, které píšete do formulářů, se nezaznamenávají."],
            ["Krátké průzkumy", "dobrovolné otázky na spokojenost s webem."],
        ],
        vice: "Údaje se ukládají v EU. Více: hotjar.com/legal/policies/privacy",
    },
    {
        nazev: "Meta",
        firma: "Meta Platforms Ireland Ltd., Merrion Road, Dublin 4, D04 X2K5, Irsko",
        co: [
            ["Meta Pixel a Conversions API", "měření, zda reklama na Facebooku nebo Instagramu vedla k poptávce, a zobrazování reklam lidem, kteří web navštívili."],
            ["Meta Business Suite", "správa reklam, zpráv a formulářů pro zájemce z Facebooku a Instagramu."],
        ],
        vice: "Při sběru a předání údajů přes Meta Pixel jsme s Meta společnými správci (čl. 26 GDPR). Více: facebook.com/privacy/policy",
    },
    {
        nazev: "Google",
        firma: "Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irsko",
        co: [
            ["Google Analytics 4", "anonymní statistiky návštěvnosti webu."],
            ["Google Tag Manager", "technické načítání měřicích kódů podle vašeho souhlasu (Consent Mode v2)."],
            ["Google Ads", "měření konverzí z reklam ve vyhledávání a na YouTube a remarketing."],
            ["Google Maps", "vložená mapa na stránce Kontakt."],
        ],
        vice: "Více: policies.google.com/privacy",
    },
]

const PRAVA: [string, string][] = [
    ["Přístup", "můžete zjistit, jaké údaje o vás máme."],
    ["Oprava", "můžete chtít opravit nepřesné údaje."],
    ["Výmaz", "můžete chtít údaje smazat, pokud už je nepotřebujeme."],
    ["Omezení zpracování", "můžete chtít, abychom údaje dočasně nepoužívali."],
    ["Přenositelnost", "můžete chtít údaje ve strojově čitelné podobě."],
    ["Námitka", "můžete vznést námitku proti zpracování na základě oprávněného zájmu."],
    ["Odvolání souhlasu", "kdykoli v nastavení cookies nebo e-mailem."],
    ["Stížnost", "u Úřadu pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7, uoou.gov.cz."],
]

function Cast({ i, children }: { i: number; children: ReactNode }) {
    const [id, nazev] = CASTI[i]
    return (
        <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-6 flex-col gap-3 border-t-[1.5px] border-ink pt-6 md:gap-4 md:pt-8">
            <h2 id={`${id}-h`} className="flex items-baseline gap-3.5">
                <span className="font-mono text-[13px] text-red">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[19px] font-extrabold uppercase leading-[1.15] tracking-[-0.02em] md:text-2xl">{nazev}</span>
            </h2>
            {children}
        </section>
    )
}

const P = ({ children, tlumeny }: { children: ReactNode; tlumeny?: boolean }) => (
    <p className={tlumeny ? "text-[15px] leading-[1.55] text-ink-2" : "text-base leading-[1.55] md:text-[17px]"}>{children}</p>
)

function Body({ polozky }: { polozky: [string, string][] }) {
    return (
        <ul className="flex flex-col gap-2.5">
            {polozky.map(([k, v]) => (
                <li key={k} className="flex gap-3 text-base leading-[1.55] md:text-[17px]">
                    <span aria-hidden className="mt-[9px] size-2 shrink-0 bg-red" />
                    <span>
                        <strong>{k}</strong> — {v}
                    </span>
                </li>
            ))}
        </ul>
    )
}

// Desktop tabulka, na mobilu karty se štítky
function Tabulka({ hlavicka, radky, sloupce }: { hlavicka: string[]; radky: string[][]; sloupce: string }) {
    return (
        <div className="border-[1.5px] border-ink bg-panel">
            <div className={`hidden bg-ink md:grid ${sloupce}`} role="row">
                {hlavicka.map((h) => (
                    <span key={h} role="columnheader" className="px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-on-ink">
                        {h}
                    </span>
                ))}
            </div>
            {radky.map((r, i) => (
                <div key={r[0]} role="row" className={`flex flex-col gap-2 p-3.5 md:grid md:gap-0 md:p-0 ${sloupce} ${i ? "border-t border-hair" : ""}`}>
                    {r.map((c, k) => (
                        <div key={k} role="cell" className="flex flex-col gap-0.5 md:px-3.5 md:py-3">
                            {k > 0 && <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-2 md:hidden">{hlavicka[k]}</span>}
                            <span className={`text-[15px] leading-[1.45] ${k === 0 ? "font-bold" : ""}`}>{c}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default function Page() {
    return (
        <Ramec>
            <JsonLd uzly={strankaLd({ cesta: SEO.path, nazev: SEO.title, popis: SEO.description })} />
            <div className="flex flex-col gap-3.5 px-4 pb-6 pt-7 md:gap-5 md:px-16 md:pb-12 md:pt-[72px]">
                <Nadpis stitek="Ochrana soukromí" className="text-[34px] md:text-[64px]">
                    Zpracování osobních údajů
                </Nadpis>
                <p className="max-w-[860px] text-[17px] leading-normal md:text-xl">
                    Na této stránce vysvětlujeme, jaké osobní údaje o vás zpracováváme, když navštívíte náš web nebo nám pošlete poptávku, proč to děláme a jaká máte práva. Analytické a reklamní nástroje (Hotjar, Meta, Google) spouštíme jen tehdy, když nám k tomu dáte souhlas.
                </p>
                <p className="font-mono text-xs uppercase text-ink-2">Platné od 1. 12. 2026 · verze 1.0</p>
            </div>

            <div className="flex flex-col gap-7 px-4 pb-10 md:flex-row md:items-start md:gap-20 md:px-16 md:pb-24">
                <nav aria-label="Obsah stránky" className="border-[1.5px] border-ink bg-panel px-5 py-[18px] md:sticky md:top-6 md:w-[300px] md:shrink-0">
                    <p className="font-mono text-xs uppercase text-ink-2">Obsah</p>
                    <ol className="mt-2.5 flex flex-col gap-2.5">
                        {CASTI.map(([id, nazev], i) => (
                            <li key={id} className="flex gap-2.5">
                                <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                                <a href={`#${id}`} className="text-[15px] leading-[1.35] hover:underline">
                                    {nazev}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="flex min-w-0 flex-1 flex-col gap-8 md:gap-12">
                    <Cast i={0}>
                        <P>
                            Správcem osobních údajů je {FIRMA.obchodniFirma}, IČO {FIRMA.ico}, se sídlem {ADRESA}, {FIRMA.rejstrik} (dále jen „my“). Provozujeme autorizovaný prodej a servis {FIRMA.znacka} a tento web.
                        </P>
                    </Cast>
                    <Cast i={1}>
                        <Body
                            polozky={[
                                ["Kontaktní údaje", "jméno a příjmení, telefon, e-mail a text zprávy z kontaktního formuláře nebo poptávky."],
                                ["Údaje o poptávaném voze", "model, verze a barva, které jste si vybrali ve 3D showroomu."],
                                ["Údaje o návštěvě webu", "zkrácená IP adresa, typ zařízení a prohlížeče, identifikátory cookies, prohlížené stránky, kliknutí a pohyb po stránce. Tyto údaje sbíráme jen s vaším souhlasem."],
                            ]}
                        />
                    </Cast>
                    <Cast i={2}>
                        <Tabulka hlavicka={["Účel", "Právní základ", "Doba uložení"]} radky={UCELY} sloupce="md:grid-cols-[260px_300px_1fr]" />
                        <P tlumeny>Souhlas můžete kdykoli odvolat v nastavení cookies nebo e-mailem. Odvolání nemá vliv na zpracování, které proběhlo před ním.</P>
                    </Cast>
                    <Cast i={3}>
                        <P>Na webu jsou napojené tyto služby. Spustí se až po vašem souhlasu v liště cookies; do té doby se nenačítají.</P>
                        <div className="flex flex-col gap-4">
                            {NASTROJE.map((n) => (
                                <article key={n.nazev} className="flex flex-col gap-2.5 border-[1.5px] border-ink bg-panel px-5 pb-5 pt-[18px]">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.02em]">{n.nazev}</h3>
                                        <span className="border border-ink px-2 py-1 font-mono text-[11px] uppercase">Jen se souhlasem</span>
                                    </div>
                                    <p className="font-mono text-xs leading-normal text-ink-2">{n.firma}</p>
                                    <Body polozky={n.co} />
                                    <P tlumeny>{n.vice}</P>
                                </article>
                            ))}
                        </div>
                    </Cast>
                    <Cast i={4}>
                        <P>Nezbytné cookies potřebujeme, aby web fungoval, a ukládáme je bez souhlasu. Ostatní ukládáme jen s vaším souhlasem.</P>
                        <Tabulka hlavicka={["Název", "Poskytovatel", "Účel", "Platnost"]} radky={COOKIES} sloupce="md:grid-cols-[170px_170px_1fr_120px]" />
                    </Cast>
                    <Cast i={5}>
                        <P>
                            Údaje předáváme jen tomu, kdo je potřebuje k vyřízení vaší žádosti nebo k provozu webu: poskytovateli hostingu a dodavatelům IT služeb, kteří s námi mají smlouvu o zpracování, a výše uvedeným nástrojům, pokud jste dali souhlas. Pokud chcete nabídku financování nebo pojištění, předáme údaje vybranému partnerovi jen s vaším vědomím. Osobní údaje nikdy neprodáváme.
                        </P>
                    </Cast>
                    <Cast i={6}>
                        <P>
                            Meta a Google mohou údaje zpracovávat i v USA. Obě společnosti jsou certifikované v rámci EU-US Data Privacy Framework, který Evropská komise uznala za odpovídající ochranu. Tam, kde se nepoužije, chrání přenos standardní smluvní doložky EU.
                        </P>
                    </Cast>
                    <Cast i={7}>
                        <Body polozky={PRAVA} />
                    </Cast>
                    <Cast i={8}>
                        <P>
                            S dotazy k ochraně osobních údajů nebo s uplatněním práv nám napište na{" "}
                            <a href={`mailto:${FIRMA.emailGdpr}`} className="font-bold underline">
                                {FIRMA.emailGdpr}
                            </a>{" "}
                            nebo dopisem na adresu {ADRESA}. Odpovíme nejpozději do jednoho měsíce.
                        </P>
                        <Link href="/kontakt" className="group flex h-14 w-fit items-center gap-6 bg-ink pl-6 pr-1.5 font-mono text-[15px] tracking-[0.08em] text-on-ink">
                            Napsat nám
                            <span aria-hidden className="flex size-11 items-center justify-center bg-red transition-transform duration-300 ease-expo group-hover:translate-x-0.5">
                                →
                            </span>
                        </Link>
                    </Cast>
                </div>
            </div>
        </Ramec>
    )
}
