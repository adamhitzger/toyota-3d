"use client"

import { PointerEvent, useEffect, useRef, useState } from "react"

// Auto na koberci na konci průletu. Není to 3D model, ale 36 fotek z konfigurátoru Toyoty
// (každá otočená o 10°), tažením doleva/doprava se mezi nimi přepíná.
// Snímek 0 = zepředu, 9 = bok s přídí vpravo, 18 = zezadu.
const FRAMES = 36
const PX_PER_FRAME = 14
// Plátno fotek je 2048×1165
const IMG_RATIO = 2048 / 1165

type Car = {
    id: string
    name: string
    code: string
    // šířka fotky v % šířky videa: délka vozu v px na boční fotce → metry → měřítko koberce
    // (střed koberce je 6,6 m od kamery, 1 m ≈ 10,1 % šířky obrazu; +12 % za bližší bok vozu)
    widthPct: number
    // kde na fotce stojí kola (0–1 výšky), tento bod se posadí na střed koberce
    groundY: number
}

const CARS: Car[] = [
    { id: "rav4", name: "RAV4", code: "2NF_EC20", widthPct: 56, groundY: 0.76 },
    { id: "hilux", name: "Hilux", code: "040_LA20", widthPct: 77, groundY: 0.69 },
]

const src = (car: Car, i: number) => `/cars/day-exterior-${i}_${car.code}.webp`

// Střed koberce v posledním snímku videa je 50 % / 49,6 % (blender/video/koberec_pozice.json);
// kola bližšího boku stojí ~0,9 m blíž ke kameře, tj. o ~5 % výšky obrazu níž
const CARPET = { x: 50, y: 54.5 }

export default function CarViewer() {
    const [carIdx, setCarIdx] = useState(0)
    const [frame, setFrame] = useState(3)
    const drag = useRef<{ x: number; frame: number } | null>(null)
    const car = CARS[carIdx]

    // Předem stáhnout a dekódovat všechny pohledy, jinak by otáčení blikalo
    useEffect(() => {
        const order = [car, ...CARS.filter((c) => c !== car)]
        const imgs = order.flatMap((c) =>
            Array.from({ length: FRAMES }, (_, i) => {
                const im = new Image()
                im.src = src(c, i)
                im.decode().catch(() => {})
                return im
            }),
        )
        return () => imgs.forEach((im) => (im.src = ""))
    }, [car])

    const step = (d: number) => setFrame((f) => (f + d + FRAMES) % FRAMES)

    const onDown = (e: PointerEvent<HTMLDivElement>) => {
        drag.current = { x: e.clientX, frame }
        e.currentTarget.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!drag.current) return
        const d = Math.round((e.clientX - drag.current.x) / PX_PER_FRAME)
        setFrame((((drag.current.frame + d) % FRAMES) + FRAMES) % FRAMES)
    }
    const onUp = () => {
        drag.current = null
    }

    return (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[end=true]:pointer-events-auto group-data-[end=true]:opacity-100 motion-reduce:transition-none">
            {/* stejná plocha 16:9 jako video, aby procenta seděla na koberec */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2">
                <div
                    className="pointer-events-auto absolute cursor-grab touch-pan-y select-none active:cursor-grabbing"
                    style={{
                        left: `${CARPET.x}%`,
                        top: `${CARPET.y}%`,
                        width: `${car.widthPct}%`,
                        aspectRatio: IMG_RATIO,
                        transform: `translate(-50%, -${car.groundY * 100}%)`,
                    }}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element -- snímky se střídají 60× za s, next/image by je přeskládával */}
                    <img
                        src={src(car, frame)}
                        alt={`Toyota ${car.name}, pohled ${frame * 10}°`}
                        draggable={false}
                        className="h-full w-full"
                    />
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-stretch border border-[#0F0F10] bg-[#F7F7F5] font-mono text-[13px] uppercase tracking-[0.06em] text-[#0F0F10]">
                <div role="tablist" aria-label="Model" className="flex">
                    {CARS.map((c, i) => (
                        <button
                            key={c.id}
                            role="tab"
                            aria-selected={i === carIdx}
                            onClick={() => setCarIdx(i)}
                            className={`relative h-11 px-5 ${i === carIdx ? "bg-[#0F0F10] text-[#F2F2EF]" : "hover:bg-[#E1E1DE]"}`}
                        >
                            {c.name}
                            {i === carIdx && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#E2001A]" />}
                        </button>
                    ))}
                </div>
                <button aria-label="Otočit doleva" onClick={() => step(-1)} className="h-11 w-11 border-l border-[#0F0F10] hover:bg-[#E1E1DE] active:scale-[0.98]">
                    ←
                </button>
                <span className="hidden items-center border-l border-[#0F0F10] px-4 text-[#48484C] sm:flex">Táhněte pro otočení</span>
                <button aria-label="Otočit doprava" onClick={() => step(1)} className="h-11 w-11 border-l border-[#0F0F10] hover:bg-[#E1E1DE] active:scale-[0.98]">
                    →
                </button>
            </div>
        </div>
    )
}
