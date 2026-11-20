"use client"

import { useLenis } from "lenis/react"
import { Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { CSSProperties, useEffect, useState } from "react"

import { konecPruletu } from "@/components/ScrollVideo"
import { ADRESA, OTEVIRACI_DOBA } from "@/lib/firma"

// počet vozů skladem v úvodu („až 200“)
const SKLADEM = 200

// Pořadí nástupu prvku (animace .intro-in v globals.css), krok 90 ms
const poradi = (i: number) => ({ "--i": i }) as CSSProperties

// Úvod přes první záběr průletu (před vchodem). Zmizí se začátkem scrollu (data-intro, ScrollVideo).
// Obal nechytá ťuknutí (scroll musí jít přes celé video), klikací je jen tlačítko.
export default function Intro() {
    const lenis = useLenis()
    const naNabidku = () => {
        const cil = konecPruletu()
        // pomalý posun, ať průlet proběhne celý (s omezeným pohybem rovnou)
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (lenis) lenis.scrollTo(cil, { duration: reduced ? 0 : 3.2, easing: (t) => 1 - Math.pow(1 - t, 3) })
        else window.scrollTo({ top: cil })
    }

    return (
        <div data-intro className="pointer-events-none absolute inset-0">
            {/* ztmavení: na šířku zleva pod textem, na výšku zespodu */}
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/45 to-ink/10 md:bg-linear-to-r md:from-ink/85 md:via-ink/45 md:to-ink/5" />

            <div className="absolute inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] text-on-ink md:inset-x-16 md:bottom-auto md:top-[max(5rem,15vh)]">
                <p style={poradi(0)} className="intro-in flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-on-ink-2 md:text-[13px]">
                    <span aria-hidden className="size-2 bg-red" />
                    Showroom · Jihlava
                </p>

                <h1 className="mt-3 font-display text-[clamp(2.25rem,10.2vw,4rem)] font-black uppercase leading-[0.92] tracking-[-0.035em] md:mt-5 md:text-[clamp(4rem,7.6vw,8.5rem)]">
                    <span className="-mt-[0.14em] block overflow-hidden pb-[0.04em] pt-[0.14em]">
                        <span style={poradi(1)} className="intro-radek block">Toyota</span>
                    </span>
                    <span className="-mt-[0.14em] block overflow-hidden pb-[0.04em] pt-[0.14em]">
                        <span style={poradi(2)} className="intro-radek block">Vysočina.cz</span>
                    </span>
                </h1>

                {/* hlavní sdělení: skladové vozy */}
                <p style={poradi(4)} className="intro-in mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-[clamp(1.5rem,6.6vw,2.25rem)] font-black uppercase leading-none tracking-[-0.03em] md:mt-8 md:text-[clamp(2rem,3.3vw,3.25rem)]">
                    <span>
                        Až <Pocitadlo do={SKLADEM} /> vozů
                    </span>
                    <span style={poradi(7)} className="intro-skladem relative inline-block px-2.5 py-1.5 text-on-ink md:px-3.5 md:py-2">
                        <span className="relative">Skladem</span>
                    </span>
                </p>
                <p style={poradi(5)} className="intro-in mt-3 max-w-[38ch] font-body text-base leading-snug text-on-ink md:mt-4 md:text-xl">
                    Ihned k odběru, bez čekání na výrobu. Vítejte v Toyota showroomu, projděte si ho online.
                </p>

                <dl style={poradi(6)} className="intro-in mt-4 flex flex-col gap-1.5 font-body text-[15px] text-on-ink-2 md:mt-6 md:gap-4 md:text-lg">
                    <div className="flex items-center gap-2">
                        <dt className="sr-only">Adresa</dt>
                        <MapPin aria-hidden className="size-[18px] shrink-0 text-red md:size-5" strokeWidth={2} />
                        <dd>{ADRESA}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                        <dt className="sr-only">Otevírací doba</dt>
                        <Clock aria-hidden className="size-[18px] shrink-0 text-red md:size-5" strokeWidth={2} />
                        <dd>{OTEVIRACI_DOBA.join(", ")}</dd>
                    </div>
                </dl>

                {/* stejný vzhled jako Tlacitko v nabídce, jen světlé na tmavém videu */}
                <button
                    type="button"
                    onClick={naNabidku}
                    style={poradi(8)}
                    className="intro-in group pointer-events-auto mt-5 flex h-14 w-full items-center justify-between gap-6 bg-on-ink pl-6 pr-1.5 font-mono text-[15px] uppercase leading-[1.2] tracking-[0.08em] text-ink transition-transform active:scale-[0.98] md:mt-8 md:w-auto md:min-w-[340px]"
                >
                    Prohlédnout vozy
                    <span className="flex size-11 items-center justify-center bg-red transition-transform duration-300 ease-expo group-hover:translate-x-1">
                        <Image src="/ikony/arrow-right.svg" alt="" width={20} height={20} />
                    </span>
                </button>
            </div>

            {/* nápověda ke scrollu (jen na šířku, na mobilu by se pletla k tlačítku) */}
            <div style={poradi(10)} aria-hidden className="intro-in absolute bottom-8 right-16 hidden items-center gap-3 font-mono text-xs uppercase tracking-[0.12em] text-on-ink md:flex">
                Scrollujte showroomem
                <span className="relative h-10 w-px overflow-hidden bg-on-ink/30">
                    <span className="intro-scroll absolute inset-x-0 top-0 h-1/2 bg-on-ink" />
                </span>
            </div>
        </div>
    )
}

// Číslo naskočí od nuly, až se jeho řádek objeví. Bez JS / s omezeným pohybem rovnou cílová hodnota.
function Pocitadlo({ do: cil }: { do: number }) {
    const [n, setN] = useState(cil)
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        let snimek = 0
        const start = performance.now() + 450
        const delka = 1400
        const krok = (t: number) => {
            const p = Math.min(Math.max((t - start) / delka, 0), 1)
            setN(Math.round(cil * (1 - Math.pow(1 - p, 4))))
            if (p < 1) snimek = requestAnimationFrame(krok)
        }
        snimek = requestAnimationFrame(krok)
        return () => cancelAnimationFrame(snimek)
    }, [cil])
    // šířka podle cílového čísla, ať text kolem neposkakuje
    return (
        <span className="inline-block text-right tabular-nums" style={{ minWidth: `${String(cil).length * 0.78}em` }}>
            {n}
        </span>
    )
}
