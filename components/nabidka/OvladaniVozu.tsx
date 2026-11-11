import type { VUZ_QUERY_RESULT } from "@/sanity.types"

import type { Varianta } from "@/components/CarViewer"

type Verze = NonNullable<VUZ_QUERY_RESULT>["verzeModelu"][number]

const mono = "font-mono uppercase tracking-[0.06em]"

// Lišta pod autem na koberci (Figma 122:719): zpět na modely, verze, barva, otočení, poptávka,
// zpět na nabídku. Desktop = jeden řádek, mobil = tři řádky pod sebou a otáčí se jen tažením.
export default function OvladaniVozu({
    varianty,
    barva,
    onBarva,
    verze,
    slug,
    onVerze,
    onOtocit,
    onPoptat,
    onModely,
    onNabidka,
}: {
    varianty: Varianta[]
    barva: Varianta | undefined
    onBarva: (key: string) => void
    verze: Verze[]
    slug: string
    onVerze: (slug: string) => void
    onOtocit: (deg: number) => void
    onPoptat: () => void
    onModely: () => void
    onNabidka: () => void
}) {
    const vyberVerze = (vyska: string, roztahnout: boolean) => (
        <div role="radiogroup" aria-label="Verze" className={`flex ${roztahnout ? "w-full" : "border border-ink"}`}>
            {verze.map((v, i) => {
                const aktivni = v.slug === slug
                return (
                    <button
                        key={v._id}
                        role="radio"
                        aria-checked={aktivni}
                        onClick={() => onVerze(v.slug)}
                        className={`relative flex ${vyska} items-center justify-center px-3.5 text-xs ${mono} ${roztahnout ? "flex-1" : ""} ${i > 0 ? "border-l border-ink" : ""} ${aktivni ? "bg-ink text-on-ink" : "bg-panel text-ink hover:bg-paper-2"}`}
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
                <span className={`text-[10px] text-ink-2 lg:text-[11px] ${mono}`}>Barva</span>
                <span className="font-body text-[13px] font-bold text-ink lg:text-sm">{barva?.nazevBarvy}</span>
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
            <div className="hidden items-stretch whitespace-nowrap lg:flex [&>*]:shrink-0">
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
                <button onClick={onPoptat} className={`group flex h-16 items-center gap-3 bg-ink px-4 text-[13px] text-on-ink ${mono}`}>
                    Poptat <span className="transition-transform duration-300 ease-expo group-hover:translate-x-0.5">→</span>
                </button>
                <button onClick={onNabidka} className={`flex h-16 items-center bg-red px-4 text-[13px] text-on-ink ${mono}`}>
                    ← Nabídka vozů
                </button>
            </div>

            {/* mobil */}
            <div className="flex flex-col whitespace-nowrap lg:hidden">
                <div className="flex items-center gap-3 px-3.5 pb-2.5 pt-3">{vyberBarvy("size-5")}</div>
                {verze.length > 1 && <div className="border-t border-ink">{vyberVerze("h-10", true)}</div>}
                <div className="flex border-t border-ink">
                    <button onClick={onModely} className={`flex h-12 items-center px-3.5 text-xs ${mono}`}>
                        ← Modely
                    </button>
                    <button onClick={onPoptat} className={`flex h-12 flex-1 items-center justify-between bg-ink px-4 text-[13px] text-on-ink ${mono}`}>
                        Poptat <span>→</span>
                    </button>
                    <button onClick={onNabidka} className={`flex h-12 items-center bg-red px-3.5 text-xs text-on-ink ${mono}`}>
                        ← Nabídka
                    </button>
                </div>
            </div>
        </div>
    )
}
