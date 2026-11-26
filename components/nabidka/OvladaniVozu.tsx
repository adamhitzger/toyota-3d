import type { VUZ_QUERY_RESULT } from "@/sanity.types"

import type { Varianta } from "@/components/CarViewer"

import { pohon as nazevPohonu, type TypMotoru } from "./texty"

type Verze = NonNullable<VUZ_QUERY_RESULT>["verzeModelu"][number]

const mono = "font-mono uppercase tracking-[0.06em]"

// Přepínač pohonu vozu: od md vedle názvu a ceny nad lištou, na mobilu první řádek lišty
export function VyberPohonu({ pohony, pohon, onPohon }: { pohony: TypMotoru[]; pohon: TypMotoru; onPohon: (t: TypMotoru) => void }) {
    return (
        <>
            <span className={`text-[10px] text-ink-2 xl:text-[11px] ${mono}`}>Pohon</span>
            <span role="radiogroup" aria-label="Pohon" className="flex min-w-0 flex-auto border border-ink">
                {pohony.map((t, i) => {
                    const aktivni = t === pohon
                    return (
                        <button
                            key={t}
                            role="radio"
                            aria-checked={aktivni}
                            onClick={() => onPohon(t)}
                            className={`relative flex h-9 flex-auto items-center justify-center whitespace-nowrap px-2.5 text-xs xl:px-3.5 ${mono} ${i > 0 ? "border-l border-ink" : ""} ${aktivni ? "bg-ink text-on-ink" : "bg-panel text-ink hover:bg-paper-2"}`}
                        >
                            {nazevPohonu(t)}
                            {aktivni && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-red" />}
                        </button>
                    )
                })}
            </span>
        </>
    )
}

// Při výzvě (.zare-poptat) se písmena po vlně přetočí na stejná a šipka odjede vpravo a vrátí se zleva
function NapisPoptat() {
    return (
        <>
            <span className="poptat-napis">
                <span className="sr-only">Poptat</span>
                {[..."Poptat"].map((p, i) => (
                    <span key={i} aria-hidden data-p={p} style={{ animationDelay: `${i * 55}ms` }}>
                        {p}
                    </span>
                ))}
            </span>
            <span aria-hidden className="poptat-sipka transition-transform duration-300 ease-expo group-hover:translate-x-0.5">
                <span data-p="→">→</span>
            </span>
        </>
    )
}

// Lišta pod autem na koberci (Figma 122:719): zpět na modely, verze, barva, otočení, poptávka,
// zpět na nabídku. Desktop = jeden řádek, tablet = dva, mobil = tři řádky pod sebou a otáčí se jen tažením.
export default function OvladaniVozu({
    varianty,
    barva,
    onBarva,
    pohony,
    pohon,
    onPohon,
    verze,
    slug,
    onVerze,
    onOtocit,
    onPoptat,
    zare,
    onModely,
    onNabidka,
}: {
    varianty: Varianta[]
    barva: Varianta | undefined
    onBarva: (key: string) => void
    pohony: TypMotoru[]
    pohon: TypMotoru
    onPohon: (t: TypMotoru) => void
    verze: Verze[]
    slug: string
    onVerze: (slug: string) => void
    onOtocit: (deg: number) => void
    onPoptat: () => void
    zare: boolean
    onModely: () => void
    onNabidka: () => void
}) {
    const vyberVerze = (vyska: string, roztahnout: boolean) => (
        <div role="radiogroup" aria-label="Verze" className={`flex ${roztahnout ? "h-full w-full" : "border border-ink"}`}>
            {verze.map((v, i) => {
                const aktivni = v.slug === slug
                return (
                    <button
                        key={v._id}
                        role="radio"
                        aria-checked={aktivni}
                        onClick={() => onVerze(v.slug)}
                        className={`relative flex ${vyska} items-center justify-center text-xs ${mono} ${roztahnout ? "flex-auto px-1 max-[400px]:text-[11px] max-[400px]:tracking-normal" : "px-3.5"} ${i > 0 ? "border-l border-ink" : ""} ${aktivni ? "bg-ink text-on-ink" : "bg-panel text-ink hover:bg-paper-2"}`}
                    >
                        {v.verze ?? v.nazev}
                        {aktivni && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-red" />}
                    </button>
                )
            })}
        </div>
    )

    const vyberBarvy = (vzorek: string) => (
        <>
            <div className="flex shrink-0 flex-col gap-0.5">
                <span className={`text-[10px] text-ink-2 xl:text-[11px] ${mono}`}>Barva</span>
                <span className="font-body text-[13px] font-bold text-ink xl:text-sm">{barva?.nazevBarvy}</span>
            </div>
            <div role="radiogroup" aria-label="Barva" className="flex flex-wrap items-center gap-2">
                {varianty.map((v) => {
                    const aktivni = v._key === barva?._key
                    return (
                        <button
                            key={v._key}
                            role="radio"
                            aria-checked={aktivni}
                            aria-label={v.nazevBarvy}
                            title={v.nazevBarvy}
                            onClick={() => onBarva(v._key)}
                            className="flex flex-col items-center gap-1"
                        >
                            <span className={`${vzorek} ${aktivni ? "border-2 border-ink" : "border border-hair"}`} style={{ backgroundColor: v.hex ?? undefined }} />
                            <span className={`h-[3px] w-full ${aktivni ? "bg-red" : "bg-transparent"}`} />
                        </button>
                    )
                })}
            </div>
        </>
    )

    return (
        <div className="pointer-events-auto border border-ink bg-panel text-ink">
            {/* desktop */}
            <div className="hidden items-stretch whitespace-nowrap xl:flex [&>*]:shrink-0">
                <button onClick={onModely} className={`flex h-16 items-center px-4 text-[13px] hover:bg-paper-2 ${mono}`}>
                    ← Modely
                </button>
                {verze.length > 1 && (
                    <div className="flex h-16 items-center gap-2 border-l border-ink px-4">
                        <span className={`text-[11px] text-ink-2 ${mono}`}>Verze</span>
                        {vyberVerze("h-9", false)}
                    </div>
                )}
                <div className="flex h-16 items-center gap-3.5 border-l border-ink px-4">{vyberBarvy("size-6")}</div>
                <button aria-label="Otočit doleva" onClick={() => onOtocit(-30)} className="size-16 border-l border-ink font-mono text-sm hover:bg-paper-2 active:scale-[0.98]">
                    ←
                </button>
                <button aria-label="Otočit doprava" onClick={() => onOtocit(30)} className="size-16 border-l border-ink font-mono text-sm hover:bg-paper-2 active:scale-[0.98]">
                    →
                </button>
                <button onClick={onPoptat} className={`${zare ? "zare-poptat" : ""} group flex h-16 items-center gap-3 bg-ink px-4 text-[13px] text-on-ink ${mono}`}>
                    <NapisPoptat />
                </button>
                <button onClick={onNabidka} className={`flex h-16 items-center bg-red px-4 text-[13px] text-on-ink ${mono}`}>
                    ← Nabídka vozů
                </button>
            </div>

            {/* mobil */}
            <div className="flex flex-col whitespace-nowrap xl:hidden">
                {pohony.length > 1 && (
                    <div className="flex items-center gap-3 border-b border-ink px-3.5 py-2 md:hidden">
                        <VyberPohonu pohony={pohony} pohon={pohon} onPohon={onPohon} />
                    </div>
                )}
                <div className="flex flex-col md:flex-row">
                    <div className="flex items-center gap-3 px-3.5 pb-2.5 pt-3 md:py-2">{vyberBarvy("size-5")}</div>
                    {verze.length > 1 && <div className="border-t border-ink md:flex-1 md:border-l md:border-t-0">{vyberVerze("h-10 md:h-full", true)}</div>}
                </div>
                <div className="flex border-t border-ink">
                    <button onClick={onModely} className={`flex h-12 items-center px-3.5 text-xs ${mono}`}>
                        ← Modely
                    </button>
                    <button onClick={onPoptat} className={`${zare ? "zare-poptat" : ""} flex h-12 flex-1 items-center justify-between bg-ink px-4 text-[13px] text-on-ink ${mono}`}>
                        <NapisPoptat />
                    </button>
                    <button onClick={onNabidka} className={`flex h-12 items-center bg-red px-3.5 text-xs text-on-ink ${mono}`}>
                        ← Nabídka
                    </button>
                </div>
            </div>
        </div>
    )
}
