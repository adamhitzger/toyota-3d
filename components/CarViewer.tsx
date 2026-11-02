"use client"

import gsap from "gsap"
import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react"

// Auto na koberci na konci průletu. Není to 3D model, ale 36 fotek z konfigurátoru Toyoty
// (každá otočená o 10°), tažením doleva/doprava se mezi nimi přepíná.
// Snímek 0 = zepředu, 9 = bok s přídí vpravo, 18 = zezadu.
//
// Úhel je spojitá hodnota, kterou GSAP dotahuje (setrvačnost po puštění), a snímek se kreslí
// do canvasu z předem stažených a dekódovaných fotek — žádné čekání na síť při otáčení.
const FRAMES = 36
const DEG_PER_PX = 0.7
// Plátno fotek je 2048×1165
const IMG_RATIO = 2048 / 1165

type Car = {
    id: string
    name: string
    code: string
    // šířka fotky v % šířky videa na šířku: délka vozu v px na boční fotce → metry → měřítko
    // koberce (střed koberce je 6,6 m od kamery, 1 m ≈ 10,1 % šířky obrazu; +12 % za bližší bok)
    widthPct: number
    // kde na fotce stojí kola (0–1 výšky), tento bod se posadí na koberec
    groundY: number
}

const CARS: Car[] = [
    { id: "rav4", name: "RAV4", code: "2NF_EC20", widthPct: 56, groundY: 0.76 },
    { id: "hilux", name: "Hilux", code: "040_LA20", widthPct: 77, groundY: 0.69 },
]

// Kam na koberec posadit kola, v % plochy videa (blender/video/koberec_pozice_*.json; střed
// koberce je 50 % / 49,6 %, kola bližšího boku stojí ~0,9 m blíž ke kameře, tedy níž).
// Video na výšku má užší záběr (36 mm místo 24 mm, kamera o 0,6 m dál): 1 m ≈ 13,9 % šířky.
const WIDE = { x: 50, y: 54.5, scale: 1 }
const TALL = { x: 50, y: 51.8, scale: 13.9 / 10.1 }

const src = (car: Car, i: number) => `/cars/day-exterior-${i}_${car.code}.webp`

const START_FRAME = 3

// Fotky jednoho auta: stahují se s nízkou prioritou hned po načtení stránky (video má přednost),
// nejdřív každá 6. pro hrubé otáčení, pak zbytek. Každá se před použitím dekóduje.
type Sequence = { imgs: (HTMLImageElement | null)[]; started: boolean }
const sequences = new Map<string, Sequence>()
function load(car: Car, onFrame: () => void) {
    let seq = sequences.get(car.id)
    if (!seq) {
        seq = { imgs: Array(FRAMES).fill(null), started: false }
        sequences.set(car.id, seq)
    }
    if (seq.started) return seq
    seq.started = true
    const s = seq
    const order = Array.from({ length: FRAMES }, (_, i) => i).sort((a, b) => (a % 6 === START_FRAME % 6 ? 0 : 1) - (b % 6 === START_FRAME % 6 ? 0 : 1))
    order.forEach((i) => {
        const im = new Image()
        im.fetchPriority = "low"
        im.src = src(car, i)
        im.decode().then(() => {
            s.imgs[i] = im
            onFrame()
        }, () => {})
    })
    return seq
}
// nejbližší už stažený snímek, aby se při otáčení nikdy nekreslilo prázdno
function nearest(seq: Sequence, i: number) {
    for (let d = 0; d <= FRAMES / 2; d++) {
        const a = seq.imgs[(i + d) % FRAMES] ?? seq.imgs[(i - d + FRAMES) % FRAMES]
        if (a) return a
    }
    return null
}

export default function CarViewer() {
    const [carIdx, setCarIdx] = useState(0)
    const car = CARS[carIdx]
    const canvas = useRef<HTMLCanvasElement>(null)
    const box = useRef<HTMLDivElement>(null)
    const angle = useRef({ a: START_FRAME * 10 })
    const target = useRef(START_FRAME * 10)
    const to = useRef<gsap.QuickToFunc | null>(null)
    const drag = useRef<{ x: number; a: number; lastX: number; lastT: number; v: number } | null>(null)

    useEffect(() => {
        const cv = canvas.current!
        const ctx = cv.getContext("2d")!
        const ang = angle.current
        let shown = -1
        const draw = (force = false) => {
            const seq = sequences.get(car.id)
            if (!seq) return
            const i = (((Math.round(ang.a / 10) % FRAMES) + FRAMES) % FRAMES)
            if (!force && i === shown) return
            const im = nearest(seq, i)
            shown = seq.imgs[i] ? i : -1
            ctx.clearRect(0, 0, cv.width, cv.height)
            if (im) ctx.drawImage(im, 0, 0, cv.width, cv.height)
        }
        load(car, () => draw(true))
        // druhé auto stáhnout až po prvním, ať si nekonkurují
        const other = CARS.find((c) => c !== car)!
        const t = window.setTimeout(() => load(other, () => {}), 4000)

        const ro = new ResizeObserver(() => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            cv.width = Math.round(cv.clientWidth * dpr)
            cv.height = Math.round(cv.clientHeight * dpr)
            draw(true)
        })
        ro.observe(cv)

        to.current = gsap.quickTo(ang, "a", { duration: 0.6, ease: "power3.out", onUpdate: () => draw() })
        draw(true)
        return () => {
            ro.disconnect()
            window.clearTimeout(t)
            gsap.killTweensOf(ang)
        }
    }, [car])

    const rotate = (deg: number) => {
        target.current += deg
        to.current?.(target.current)
    }
    const switchCar = (i: number) => {
        if (i === carIdx) return
        gsap.to(box.current, {
            autoAlpha: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                setCarIdx(i)
                gsap.to(box.current, { autoAlpha: 1, duration: 0.45, ease: "expo.out", delay: 0.05 })
            },
        })
    }

    const onDown = (e: PointerEvent<HTMLDivElement>) => {
        drag.current = { x: e.clientX, a: target.current, lastX: e.clientX, lastT: e.timeStamp, v: 0 }
        e.currentTarget.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        const d = drag.current
        if (!d) return
        const dt = Math.max(e.timeStamp - d.lastT, 1)
        d.v = 0.8 * d.v + 0.2 * ((e.clientX - d.lastX) / dt)
        d.lastX = e.clientX
        d.lastT = e.timeStamp
        target.current = d.a + (e.clientX - d.x) * DEG_PER_PX
        to.current?.(target.current)
    }
    const onUp = () => {
        const d = drag.current
        drag.current = null
        // setrvačnost: auto se po puštění ještě kousek dotočí podle rychlosti tahu (px/ms)
        if (d && Math.abs(d.v) > 0.05) rotate(Math.max(-90, Math.min(90, d.v * 160)))
    }

    return (
        <div className="pointer-events-none absolute inset-0">
            {/* stejná plocha jako video (16:9, na výšku 9:16), aby procenta seděla na koberec */}
            <div className="absolute left-1/2 top-1/2 aspect-video w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2 portrait:aspect-[9/16] portrait:w-[max(100vw,56.25vh)]">
                <div data-reveal className="invisible absolute inset-0">
                    <div
                        ref={box}
                        className="pointer-events-auto absolute left-(--wx) top-(--wy) w-(--ww) cursor-grab touch-pan-y select-none active:cursor-grabbing portrait:left-(--tx) portrait:top-(--ty) portrait:w-(--tw)"
                        style={{
                            "--wx": `${WIDE.x}%`,
                            "--wy": `${WIDE.y}%`,
                            "--ww": `${car.widthPct * WIDE.scale}%`,
                            "--tx": `${TALL.x}%`,
                            "--ty": `${TALL.y}%`,
                            "--tw": `${car.widthPct * TALL.scale}%`,
                            aspectRatio: IMG_RATIO,
                            transform: `translate(-50%, -${car.groundY * 100}%)`,
                        } as CSSProperties}
                        onPointerDown={onDown}
                        onPointerMove={onMove}
                        onPointerUp={onUp}
                        onPointerCancel={onUp}
                    >
                        <canvas ref={canvas} role="img" aria-label={`Toyota ${car.name}, otočná fotka`} className="h-full w-full" />
                    </div>
                </div>
            </div>

            <div data-reveal className="pointer-events-auto invisible absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-stretch border border-[#0F0F10] bg-[#F7F7F5] font-mono text-[13px] uppercase tracking-[0.06em] text-[#0F0F10]">
                <div role="tablist" aria-label="Model" className="flex">
                    {CARS.map((c, i) => (
                        <button
                            key={c.id}
                            role="tab"
                            aria-selected={i === carIdx}
                            onClick={() => switchCar(i)}
                            className={`relative h-11 px-5 ${i === carIdx ? "bg-[#0F0F10] text-[#F2F2EF]" : "hover:bg-[#E1E1DE]"}`}
                        >
                            {c.name}
                            {i === carIdx && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#E2001A]" />}
                        </button>
                    ))}
                </div>
                <button aria-label="Otočit doleva" onClick={() => rotate(-10)} className="h-11 w-11 border-l border-[#0F0F10] hover:bg-[#E1E1DE] active:scale-[0.98]">
                    ←
                </button>
                <span className="hidden items-center border-l border-[#0F0F10] px-4 text-[#48484C] sm:flex">Táhněte pro otočení</span>
                <button aria-label="Otočit doprava" onClick={() => rotate(10)} className="h-11 w-11 border-l border-[#0F0F10] hover:bg-[#E1E1DE] active:scale-[0.98]">
                    →
                </button>
            </div>
        </div>
    )
}
