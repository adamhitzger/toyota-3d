"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type Lenis from "lenis"
import { LenisRef, ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"
import { ReactNode, useEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

// Lenis vyhlazuje kolečko myši (rychlé cvrnknutí už nepřeskočí půl videa najednou)
// a běží na stejném ticku jako GSAP, takže ScrollTrigger čte vždy aktuální pozici.
export default function SmoothScroll({ children }: { children: ReactNode }) {
    const lenisRef = useRef<LenisRef>(null)

    useEffect(() => {
        // instance Lenisu vzniká až v efektu ReactLenis, proto se čte z refu při každém ticku
        let hooked: Lenis | undefined
        const update = (time: number) => {
            const lenis = lenisRef.current?.lenis
            if (!lenis) return
            if (hooked !== lenis) {
                lenis.on("scroll", ScrollTrigger.update)
                hooked = lenis
            }
            lenis.raf(time * 1000)
        }
        gsap.ticker.add(update)
        gsap.ticker.lagSmoothing(0)
        return () => {
            gsap.ticker.remove(update)
            hooked?.off("scroll", ScrollTrigger.update)
        }
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.08, wheelMultiplier: 0.8 }}>
            {children}
        </ReactLenis>
    )
}
