"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ReactNode, useRef } from "react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Video průletu se nepřehrává samo, jeho čas řídí scroll přes ScrollTrigger: sekce je
// SCROLL_VH vysoká, video v ní drží sticky přes celou obrazovku. Soubory jsou kódované
// jen z klíčových snímků (keyint=1), takže každý seek dekóduje jediný snímek.
//
// Videa jsou dvě: na šířku (16:9) a na výšku (9:16, mobil). Viditelnost přepíná Tailwind
// (portrait:/landscape:), ale stahuje a ovládá se jen to, které odpovídá orientaci (gsap.matchMedia).
const SCROLL_VH = 500
const DURATION = 390 / 30
// Od snímku 350 video stojí před kobercem → tehdy vyjede auto (prvky s data-reveal)
const HOLD_AT = 350 / 30
// Jak dlouho (v s) se čas videa dotahuje za scrollem, vyhlazuje rychlé scrollování
const SCRUB = 0.6
// video zabírá 90 % scrollu, poslední kus jen drží auto na koberci
const VIDEO_END = 0.9

export default function ScrollVideo({ children }: { children?: ReactNode }) {
    const section = useRef<HTMLElement>(null)
    const wide = useRef<HTMLVideoElement>(null)
    const tall = useRef<HTMLVideoElement>(null)

    useGSAP(
        () => {
            const mm = gsap.matchMedia()
            mm.add(
                // gsap volá funkci, jen když platí aspoň jedna podmínka → obě orientace zvlášť
                {
                    portrait: "(orientation: portrait)",
                    landscape: "(orientation: landscape)",
                    reduced: "(prefers-reduced-motion: reduce)",
                },
                (ctx) => {
                    const { portrait, reduced } = ctx.conditions!
                    const v = (portrait ? tall : wide).current!
                    if (v.preload !== "auto") {
                        v.preload = "auto"
                        v.load()
                    }

                    // seek jen když předchozí doběhl, jinak se fronta seeků hromadí a obraz stojí
                    let wanted = 0
                    const seek = () => {
                        if (!v.seeking && v.readyState >= 1 && Math.abs(v.currentTime - wanted) > 0.001) v.currentTime = wanted
                    }
                    v.addEventListener("seeked", seek)
                    v.addEventListener("loadedmetadata", seek)

                    const playhead = { t: 0 }
                    const tl = gsap.timeline({
                        defaults: { ease: "none" },
                        scrollTrigger: {
                            trigger: section.current,
                            start: "top top",
                            end: "bottom bottom",
                            scrub: reduced ? true : SCRUB,
                        },
                    })
                    tl.to(playhead, {
                        t: DURATION,
                        duration: VIDEO_END,
                        onUpdate: () => {
                            wanted = Math.min(playhead.t, DURATION - 0.01)
                            seek()
                        },
                    })
                    // úvodní nadpis zmizí hned na začátku průletu
                    tl.to("[data-intro]", { autoAlpha: 0, y: -40, ease: "power2.in", duration: 0.07 }, 0)
                    tl.fromTo(
                        "[data-reveal]",
                        { autoAlpha: 0, y: 24 },
                        { autoAlpha: 1, y: 0, ease: "expo.out", duration: 0.08, stagger: 0.02 },
                        (HOLD_AT / DURATION) * VIDEO_END,
                    )

                    // iOS Safari dovolí seek až po prvním přehrání
                    const unlock = () => v.play().then(() => v.pause()).catch(() => {})
                    window.addEventListener("touchstart", unlock, { once: true, passive: true })
                    return () => {
                        v.removeEventListener("seeked", seek)
                        v.removeEventListener("loadedmetadata", seek)
                        window.removeEventListener("touchstart", unlock)
                    }
                },
            )
        },
        { scope: section },
    )

    return (
        <section ref={section} className="relative w-full" style={{ height: `${SCROLL_VH}vh` }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0F0F10]">
                {/* Plocha videa vždy přes celou obrazovku (jako object-cover), takže procenta
                    z koberec_pozice_*.json sedí na obraz. */}
                <div className="absolute left-1/2 top-1/2 aspect-video w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2 portrait:hidden">
                    <video
                        ref={wide}
                        className="absolute inset-0 h-full w-full"
                        src="/video/pruchod-showroomem.mp4"
                        poster="/video/pruchod-poster.jpg"
                        muted
                        playsInline
                        preload="none"
                        aria-label="Průlet showroomem Toyota Vysočina"
                    />
                </div>
                <div className="absolute left-1/2 top-1/2 aspect-[9/16] w-[max(100vw,56.25vh)] -translate-x-1/2 -translate-y-1/2 landscape:hidden">
                    <video
                        ref={tall}
                        className="absolute inset-0 h-full w-full"
                        src="/video/pruchod-showroomem-vyska.mp4"
                        poster="/video/pruchod-poster-vyska.jpg"
                        muted
                        playsInline
                        preload="none"
                        aria-label="Průlet showroomem Toyota Vysočina"
                    />
                </div>
                {/* vrstva nad videem: data-intro zmizí se začátkem scrollu, data-reveal se odkryje,
                    až video zastaví před kobercem */}
                {children}
            </div>
        </section>
    )
}
