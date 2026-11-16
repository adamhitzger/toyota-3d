"use client"

import { useState } from "react"

import { MAPA_EMBED, MAPA_NAVIGACE } from "@/lib/firma"

// Google Maps se načtou až po kliknutí — vložená mapa ukládá cookies Googlu,
// takže bez souhlasu se nesmí načíst sama (stránka Zpracování osobních údajů, část 04).
export default function Mapa() {
    const [nacist, setNacist] = useState(false)
    return (
        <div className="flex flex-col gap-2.5">
            <div className="relative h-[300px] overflow-hidden border-[1.5px] border-ink bg-paper-2 md:h-[460px]">
                {nacist ? (
                    <iframe
                        src={MAPA_EMBED}
                        title="Mapa: Toyota Vysočina, Rantířovská 4844/6, Jihlava"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0 size-full border-0"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                        <p className="max-w-[46ch] font-body text-[15px] leading-[1.45] text-ink-2">
                            Mapa se načítá ze služby Google Maps, která při zobrazení ukládá cookies.
                        </p>
                        <button
                            type="button"
                            onClick={() => setNacist(true)}
                            className="border-[1.5px] border-ink bg-panel px-5 py-3 font-mono text-[13px] uppercase hover:bg-ink hover:text-on-ink"
                        >
                            Zobrazit mapu
                        </button>
                    </div>
                )}
            </div>
            <div className="flex justify-between gap-4 font-mono text-xs uppercase">
                <span className="text-ink-2">Mapa: Google Maps</span>
                <a href={MAPA_NAVIGACE} target="_blank" rel="noopener noreferrer" className="underline">
                    Navigovat →
                </a>
            </div>
        </div>
    )
}
