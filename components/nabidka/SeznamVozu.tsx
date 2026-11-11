"use client"

import { useState } from "react"

import type { MODELY_QUERY_RESULT, VOZY_QUERY_RESULT } from "@/sanity.types"

import { POHONY, cena, ceniky, nazevKategorie, pohon, pohony, verze, type Kategorie, type TypMotoru } from "./texty"
import { Foto, Sipka, Stitek, Tlacitko } from "./ui"

type Model = MODELY_QUERY_RESULT[number]
type Vuz = VOZY_QUERY_RESULT[number]

const nadpis = "font-display font-black uppercase leading-[0.95] text-ink text-[36px] tracking-[-0.035em] md:text-[72px]"

// Obsah vysouvacího panelu (Figma 118:324 / 118:556): mřížka modelů kategorie s filtrem pohonu,
// po kliknutí na model jeho verze (= vozy toho modelu v kategorii).
export default function SeznamVozu({
    kategorie,
    modely,
    vozy,
    modelId,
    onModel,
    onVuz,
}: {
    kategorie: Kategorie
    modely: Model[]
    vozy: Vuz[]
    modelId: string | null
    onModel: (id: string | null) => void
    onVuz: (slug: string) => void
}) {
    const model = modelId ? modely.find((m) => m._id === modelId) : undefined
    return model ? (
        <VerzeModelu
            kategorie={kategorie}
            model={model}
            vozy={vozy.filter((v) => v.model._id === model._id && v.kategorie === kategorie)}
            onZpet={() => onModel(null)}
            onVuz={onVuz}
        />
    ) : (
        <MrizkaModelu kategorie={kategorie} modely={modely} onModel={onModel} />
    )
}

function MrizkaModelu({ kategorie, modely, onModel }: { kategorie: Kategorie; modely: Model[]; onModel: (id: string) => void }) {
    const [filtr, setFiltr] = useState<TypMotoru | null>(null)
    const viditelne = filtr ? modely.filter((m) => m.typyMotoru.includes(filtr)) : modely
    const volby = [{ value: null, filtr: "Vše" }, ...POHONY]

    return (
        <div className="flex flex-col gap-3.5 md:gap-5">
            <div className="flex flex-col gap-1 md:gap-2">
                <Stitek>[ Nabídka vozů ]</Stitek>
                <h2 className={nadpis}>{nazevKategorie(kategorie)}</h2>
            </div>
            <div role="group" aria-label="Filtr pohonu" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
                {volby.map((p) => {
                    const aktivni = filtr === p.value
                    return (
                        <button
                            key={p.filtr}
                            aria-pressed={aktivni}
                            onClick={() => setFiltr(p.value)}
                            className={`shrink-0 border border-ink px-3 py-2 font-mono text-xs uppercase tracking-[0.06em] ${aktivni ? "bg-ink text-on-ink" : "bg-panel text-ink hover:bg-paper-2"}`}
                        >
                            {p.filtr}
                        </button>
                    )
                })}
            </div>
            {viditelne.length === 0 ? (
                <p className="py-10 font-body text-lg text-ink-2">
                    {modely.length === 0 ? "V této nabídce teď nemáme žádné vozy." : "S tímto pohonem tu teď žádný model nemáme."}
                </p>
            ) : (
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] md:gap-4">
                    {viditelne.map((m) => (
                        <li key={m._id} className="flex">
                            <button
                                onClick={() => onModel(m._id)}
                                className="group flex w-full flex-col border border-ink bg-panel text-left uppercase transition-transform active:scale-[0.98]"
                            >
                                <Foto foto={m.foto} width={205} className="h-[92px] w-full md:h-28" />
                                <span className="flex w-full flex-1 flex-col gap-1 px-3 py-2.5">
                                    <span className="font-display text-xs font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-sm">{m.nazev}</span>
                                    <span className="font-mono text-[11px] tracking-[0.06em] text-ink-2">{pohony(m.typyMotoru as TypMotoru[])}</span>
                                </span>
                                <span className="flex w-full items-center gap-2 border-t border-ink pl-3">
                                    <span className="flex-1 font-mono text-[11px] tracking-[0.06em] text-ink">{ceniky(m.pocetVozu)}</span>
                                    <Sipka />
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function VerzeModelu({
    kategorie,
    model,
    vozy,
    onZpet,
    onVuz,
}: {
    kategorie: Kategorie
    model: Model
    vozy: Vuz[]
    onZpet: () => void
    onVuz: (slug: string) => void
}) {
    return (
        <div className="flex flex-col gap-3.5 md:gap-6">
            <div className="flex flex-col gap-1 md:gap-2">
                <Stitek>
                    [{" "}
                    <button onClick={onZpet} className="uppercase underline decoration-hair underline-offset-4 hover:text-ink hover:decoration-ink">
                        {nazevKategorie(kategorie)}
                    </button>{" "}
                    / {model.nazev} ]
                </Stitek>
                <h2 className={nadpis}>{model.nazev}</h2>
                <p className="font-body text-[15px] text-ink-2 md:text-lg">
                    {pohony(model.typyMotoru as TypMotoru[])} · {verze(vozy.length)}
                </p>
            </div>
            <ul className="flex flex-col gap-2.5 md:grid md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] md:gap-6">
                {vozy.map((v) => (
                    <li key={v._id} className="flex">
                        {/* mobil: kompaktní řádek (foto | název, cena, barvy | šipka) */}
                        <button
                            onClick={() => onVuz(v.slug)}
                            className="group flex w-full items-center gap-3 border border-ink bg-panel p-3 text-left transition-transform active:scale-[0.98] md:hidden"
                        >
                            <Foto foto={v.foto} width={112} className="h-[76px] w-28 shrink-0" />
                            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                                <span className="font-display text-base font-extrabold leading-none tracking-[-0.02em] text-ink">{v.nazev}</span>
                                <span className="font-display text-[15px] font-black tracking-[-0.02em] text-ink">{cena(v.cenaOd)}</span>
                                <Vzorky barvy={v.barvy} velikost="size-3" mezera="gap-1" />
                            </span>
                            <Sipka />
                        </button>
                        {/* desktop: karta verze */}
                        <div className="hidden w-full flex-col gap-3.5 border border-ink bg-panel p-6 md:flex">
                            <div className="flex gap-2">
                                <span className="border border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink">{pohon(v.typMotoru)}</span>
                            </div>
                            <h3 className="font-display text-[26px] font-extrabold leading-none tracking-[-0.02em] text-ink">{v.nazev}</h3>
                            <Foto foto={v.foto} width={373} alt={v.nazev} className="h-[150px] w-full" />
                            <Vzorky barvy={v.barvy} velikost="size-5" mezera="gap-1.5" />
                            <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2">Cena od</span>
                                <span className="font-display text-[28px] font-black tracking-[-0.02em] text-ink">{cena(v.cenaOd)}</span>
                            </div>
                            <Tlacitko onClick={() => onVuz(v.slug)} className="mt-auto">
                                Prozkoumat
                            </Tlacitko>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function Vzorky({ barvy, velikost, mezera }: { barvy: Vuz["barvy"]; velikost: string; mezera: string }) {
    return (
        <span className={`flex flex-wrap items-center ${mezera}`} aria-label={`Barvy: ${barvy.map((b) => b.nazevBarvy).join(", ")}`}>
            {barvy.map((b, i) => (
                <span
                    key={b._key}
                    title={b.nazevBarvy}
                    className={`${velikost} shrink-0 ${i === 0 ? "border-2 border-ink" : "border border-hair"}`}
                    style={{ backgroundColor: b.hex ?? undefined }}
                />
            ))}
        </span>
    )
}
