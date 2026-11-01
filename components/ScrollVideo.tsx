"use client"

import { ReactNode, useEffect, useRef } from "react"

// Video průletu se nepřehrává samo, jeho čas řídí scroll: sekce je SCROLL_VH vysoká,
// video v ní drží sticky přes celou obrazovku. Soubor je kódovaný s klíčovým snímkem
// každých 5 snímků, jinak by přetáčení sekalo.
const SCROLL_VH = 500
// Dotahování času k cíli (0–1 za snímek): menší = plynulejší, ale víc „plave“ za scrollem
const LERP = 0.15
// Od tohoto času video stojí před kobercem (snímek 350 z 390) → sticky vrstva dostane data-end
const END_AT = 350 / 30

export default function ScrollVideo({ children }: { children?: ReactNode }) {
    const section = useRef<HTMLElement>(null)
    const video = useRef<HTMLVideoElement>(null)
    const stage = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = section.current
        const v = video.current
        const st = stage.current
        if (!el || !v || !st) return

        let target = 0
        let current = 0
        let raf = 0

        const progress = () => {
            const r = el.getBoundingClientRect()
            const range = r.height - window.innerHeight
            return range > 0 ? Math.min(Math.max(-r.top / range, 0), 1) : 0
        }
        const onScroll = () => {
            if (v.duration) target = progress() * v.duration
        }
        const tick = () => {
            if (v.duration) {
                const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                current = reduced ? target : current + (target - current) * LERP
                // seekovat jen při znatelné změně, ať prohlížeč nestojí ve frontě seeků
                if (Math.abs(v.currentTime - current) > 0.01 && !v.seeking) v.currentTime = current
                const end = String(current >= END_AT - 0.05)
                if (st.dataset.end !== end) st.dataset.end = end
            }
            raf = requestAnimationFrame(tick)
        }
        // iOS Safari dovolí seek až po prvním přehrání
        const unlock = () => {
            v.play().then(() => v.pause()).catch(() => {})
        }

        v.addEventListener("loadedmetadata", onScroll)
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        window.addEventListener("touchstart", unlock, { once: true, passive: true })
        onScroll()
        raf = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(raf)
            v.removeEventListener("loadedmetadata", onScroll)
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
            window.removeEventListener("touchstart", unlock)
        }
    }, [])

    return (
        <section ref={section} className="relative w-full" style={{ height: `${SCROLL_VH}vh` }}>
            <div ref={stage} data-end="false" className="group sticky top-0 h-screen w-full overflow-hidden bg-[#0F0F10]">
                {/* Plocha 16:9 vždy přes celou obrazovku (jako object-cover), takže procenta
                    z koberec_pozice.json sedí na obraz videa. */}
                <div className="absolute left-1/2 top-1/2 aspect-video w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2">
                    <video
                        ref={video}
                        className="absolute inset-0 h-full w-full"
                        src="/video/pruchod-showroomem.mp4"
                        poster="/video/pruchod-poster.jpg"
                        muted
                        playsInline
                        preload="auto"
                        aria-label="Průlet showroomem Toyota Vysočina"
                    />
                </div>
                {/* vrstva nad videem, na konci průletu má rodič data-end="true" (group-data-[end=true]:…) */}
                {children}
            </div>
        </section>
    )
}
