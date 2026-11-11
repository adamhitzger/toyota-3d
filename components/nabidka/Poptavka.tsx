"use client"

import Image from "next/image"
import { FormEvent, ReactNode, useId, useState } from "react"

import type { VOZY_QUERY_RESULT } from "@/sanity.types"

import type { Fotka } from "@/components/CarViewer"

import { PRODEJNA, cena, pohon } from "./texty"
import { Foto, Stitek, Tlacitko, Zavrit } from "./ui"

type Vuz = VOZY_QUERY_RESULT[number]

const popisek = "font-body text-[17px] font-bold leading-[1.3] text-ink"
const pole = "h-14 w-full border-[1.5px] border-ink bg-panel px-4 font-body text-lg text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-ink"

// Poptávka (Figma 128:693 desktop / 128:769 mobil): vlevo shrnutí vybraného vozu, vpravo formulář
// s předvybraným vozem a barvou. Mobil má souhlas a odeslání přilepené dole.
export default function Poptavka({
    vuz,
    verze,
    barvaKey,
    foto,
    onZavrit,
}: {
    vuz: Vuz
    // vozy stejného modelu v kategorii, mezi kterými jde ve formuláři přepnout
    verze: Vuz[]
    barvaKey: string | undefined
    foto: Fotka | null
    onZavrit: () => void
}) {
    const [slug, setSlug] = useState(vuz.slug)
    const vybrany = verze.find((v) => v.slug === slug) ?? vuz
    const [barva, setBarva] = useState<string | undefined>(barvaKey ?? vybrany.barvy[0]?._key)
    const vybranaBarva = vybrany.barvy.find((b) => b._key === barva) ?? vybrany.barvy[0]
    const [kontakt, setKontakt] = useState<"telefon" | "email">("telefon")
    const [odeslano, setOdeslano] = useState(false)
    const id = useId()

    const zmenVerzi = (s: string) => {
        setSlug(s)
        // barvu podle názvu přenést, pokud ji nová verze má
        const nova = verze.find((v) => v.slug === s)
        setBarva(nova?.barvy.find((b) => b.nazevBarvy === vybranaBarva?.nazevBarvy)?._key ?? nova?.barvy[0]?._key)
    }

    const odeslat = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // TODO: napojit na odeslání (e-mail / CRM prodejny); zatím jen potvrzení v UI
        setOdeslano(true)
    }

    const radky: [string, ReactNode][] = [
        ["Model", `${vybrany.model.nazev} ${vybrany.verze ?? ""}`.trim()],
        ["Barva", vybranaBarva?.nazevBarvy],
        ["Pohon", pohon(vybrany.typMotoru)],
        ["Cena od", cena(vybrany.cenaOd)],
        ["Prodejna", PRODEJNA],
    ]

    const souhlasAOdeslani = (
        <>
            <label className="flex items-center gap-3">
                <input required type="checkbox" name="souhlas" className="size-[22px] shrink-0 appearance-none border-[1.5px] border-ink bg-panel checked:bg-ink checked:shadow-[inset_0_0_0_4px_var(--color-panel)]" />
                <span className="font-body text-[13px] text-ink md:text-[15px]">Souhlasím se zpracováním osobních údajů za účelem nabídky.</span>
            </label>
            <Tlacitko type="submit">Odeslat poptávku</Tlacitko>
        </>
    )

    return (
        <div role="dialog" aria-modal="true" aria-labelledby={`${id}-nadpis`} className="pointer-events-auto absolute inset-x-0 bottom-0 top-12 flex flex-col border-t border-ink bg-paper md:top-[72px]">
            <Zavrit onClick={onZavrit} label="Zavřít poptávku" />
            {odeslano ? (
                <div className="flex flex-1 flex-col items-start justify-center gap-4 px-4 md:px-16">
                    <Stitek>[ Poptávka odeslána ]</Stitek>
                    <h2 id={`${id}-nadpis`} className="font-display text-[36px] font-black uppercase leading-[0.9] tracking-[-0.035em] text-ink md:text-[72px]">
                        Děkujeme
                    </h2>
                    <p className="max-w-[40ch] font-body text-lg text-ink">
                        Prodejce z Jihlavy se vám ozve {kontakt === "telefon" ? "telefonicky" : "e-mailem"} s nabídkou na {vybrany.nazev} a termínem testovací jízdy.
                    </p>
                    <Tlacitko onClick={onZavrit} className="max-w-sm">
                        Zpět k vozu
                    </Tlacitko>
                </div>
            ) : (
                <form onSubmit={odeslat} className="flex min-h-0 flex-1 flex-col">
                    <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 md:px-16 md:pb-10 md:pt-10">
                        <div className="mx-auto grid max-w-[1312px] gap-3.5 md:grid-cols-[minmax(0,560px)_minmax(0,560px)] md:justify-between md:gap-x-16">
                            {/* shrnutí vozu */}
                            <section className="flex flex-col gap-3.5 md:gap-5">
                                <Stitek>[ Poptávka ]</Stitek>
                                <h2 id={`${id}-nadpis`} className="hidden font-display text-[72px] font-black uppercase leading-[0.9] tracking-[-0.035em] text-ink md:block">
                                    Vaše {vybrany.nazev}
                                </h2>
                                <div className="flex items-center gap-3 md:block">
                                    <Foto foto={foto} width={560} alt={vybrany.nazev} className="aspect-[2048/1165] w-[132px] shrink-0 md:w-full md:bg-transparent" />
                                    <div className="flex flex-col gap-0.5 md:hidden">
                                        <p className="font-display text-[22px] font-black uppercase tracking-[-0.03em] text-ink">{vybrany.nazev}</p>
                                        <p className="font-body text-[15px] font-bold text-ink">od {cena(vybrany.cenaOd)}</p>
                                    </div>
                                </div>
                                <dl className="hidden border-t-[1.5px] border-ink md:block">
                                    {radky.map(([k, v]) => (
                                        <div key={k} className="flex items-center border-b border-hair py-2.5">
                                            <dt className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2">{k}</dt>
                                            <dd className="font-body text-base font-bold text-ink">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>

                            {/* formulář */}
                            <section className="flex flex-col gap-3.5 md:gap-[18px] md:pt-14">
                                <p className="hidden font-body text-lg leading-[1.4] text-ink md:block">
                                    Prodejce z Jihlavy se vám ozve s nabídkou a termínem testovací jízdy.
                                </p>
                                <div className="flex gap-2.5 md:gap-4">
                                    <Vyber label="Model" value={slug} onChange={zmenVerzi}>
                                        {verze.map((v) => (
                                            <option key={v.slug} value={v.slug}>
                                                {v.nazev}
                                            </option>
                                        ))}
                                    </Vyber>
                                    <Vyber label="Barva" value={vybranaBarva?._key ?? ""} onChange={setBarva} vzorek={vybranaBarva?.hex}>
                                        {vybrany.barvy.map((b) => (
                                            <option key={b._key} value={b._key}>
                                                {b.nazevBarvy}
                                            </option>
                                        ))}
                                    </Vyber>
                                </div>
                                <label className="flex flex-col gap-2">
                                    <span className={popisek}>Jméno a příjmení</span>
                                    <input required name="jmeno" autoComplete="name" placeholder="Např. Petra Dvořáková" className={pole} />
                                </label>
                                <div className="flex flex-col gap-3.5 md:flex-row md:gap-4">
                                    <label className="flex flex-1 flex-col gap-2">
                                        <span className={popisek}>Telefon</span>
                                        <input required={kontakt === "telefon"} name="telefon" type="tel" autoComplete="tel" placeholder="+420" className={pole} />
                                    </label>
                                    <label className="flex flex-1 flex-col gap-2">
                                        <span className={popisek}>E-mail</span>
                                        <input required={kontakt === "email"} name="email" type="email" autoComplete="email" placeholder="Např. petra@email.cz" className={pole} />
                                    </label>
                                </div>
                                <fieldset className="flex flex-col gap-2">
                                    <legend className={`${popisek} mb-2`}>Jak vás máme kontaktovat?</legend>
                                    <div className="flex border-[1.5px] border-ink">
                                        {(
                                            [
                                                ["telefon", "Zavolejte mi"],
                                                ["email", "Napište e-mail"],
                                            ] as const
                                        ).map(([v, text]) => {
                                            const aktivni = kontakt === v
                                            return (
                                                <label key={v} className={`flex h-[52px] flex-1 cursor-pointer items-center gap-2.5 px-3.5 ${aktivni ? "bg-ink text-on-ink" : "bg-panel text-ink"}`}>
                                                    <input type="radio" name="kontakt" value={v} checked={aktivni} onChange={() => setKontakt(v)} className="sr-only" />
                                                    <span className={`relative size-[18px] shrink-0 border-[1.5px] ${aktivni ? "border-on-ink" : "border-ink"}`}>
                                                        {aktivni && <span className="absolute left-[2.5px] top-[2.5px] size-2.5 bg-red" />}
                                                    </span>
                                                    <span className="font-body text-base font-bold">{text}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </fieldset>
                                <label className="flex flex-col gap-2">
                                    <span className={popisek}>Poznámka (nepovinné)</span>
                                    <input name="poznamka" placeholder="Např. financování nebo výkup vozu" className={pole} />
                                </label>
                                <div className="hidden flex-col gap-[18px] md:flex">{souhlasAOdeslani}</div>
                            </section>
                        </div>
                    </div>
                    {/* mobil: souhlas a odeslání přilepené dole */}
                    <div className="flex flex-col gap-2.5 border-t border-ink bg-paper px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:hidden">{souhlasAOdeslani}</div>
                </form>
            )}
        </div>
    )
}

// Rozbalovací pole (Figma 128:685): předvyplněná hodnota tučně, u barvy vzorek laku
function Vyber({ label, value, onChange, vzorek, children }: { label: string; value: string; onChange: (v: string) => void; vzorek?: string | null; children: ReactNode }) {
    return (
        <label className="flex min-w-0 flex-1 flex-col gap-2">
            <span className={popisek}>{label}</span>
            <span className="relative flex h-14 items-center border-[1.5px] border-ink bg-panel focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
                {vzorek !== undefined && <span className="pointer-events-none absolute left-4 size-5 border border-ink" style={{ backgroundColor: vzorek ?? undefined }} />}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`h-full w-full min-w-0 appearance-none truncate bg-transparent pr-11 font-body text-lg font-bold text-ink outline-none ${vzorek !== undefined ? "pl-12" : "pl-4"}`}
                >
                    {children}
                </select>
                <Image src="/ikony/chevron-down.svg" alt="" width={20} height={20} className="pointer-events-none absolute right-4" />
            </span>
        </label>
    )
}
