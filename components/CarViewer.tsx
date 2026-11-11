"use client"

import gsap from "gsap"
import { CSSProperties, PointerEvent, Ref, useEffect, useImperativeHandle, useRef } from "react"

import type { VARIANTA_FOTKY_QUERY_RESULT, VUZ_QUERY_RESULT } from "@/sanity.types"
import { urlFor } from "@/sanity/lib/image"

// Auto na koberci na konci průletu. Není to 3D model, ale otočné fotky z barevné varianty v Sanity
// (fotka 0 = 3/4 zepředu, každá další o 360°/počet dál), tažením doleva/doprava se mezi nimi přepíná.
//
// Úhel je spojitá hodnota, kterou GSAP dotahuje (setrvačnost po puštění), a snímek se kreslí
// do canvasu z předem stažených a dekódovaných fotek. Hned se stahuje jen první fotka,
// zbytek (VARIANTA_FOTKY_QUERY) až při prvním otočení.
const DEG_PER_PX = 0.7
// Plátno fotek je 2048×1165
const IMG_RATIO = 2048 / 1165

export type Fotka = NonNullable<VARIANTA_FOTKY_QUERY_RESULT>[number]
export type Varianta = NonNullable<VUZ_QUERY_RESULT>["varianty"][number]

// Rozměr auta na fotce: šířka fotky v % šířky videa na šířku (délka vozu → metry → měřítko
// koberce; střed koberce je 6,6 m od kamery, 1 m ≈ 10,1 % šířky obrazu, +12 % za bližší bok)
// a kde na fotce stojí kola (0–1 výšky), ten bod se posadí na koberec.
export type Geometrie = { widthPct: number; groundY: number }

// Kam na koberec posadit kola, v % plochy videa (blender/video/koberec_pozice_*.json; střed
// koberce je 50 % / 49,6 %, kola bližšího boku stojí ~0,9 m blíž ke kameře, tedy níž).
// Video na výšku má užší záběr (36 mm místo 24 mm, kamera o 0,6 m dál): 1 m ≈ 13,9 % šířky.
const WIDE = { x: 50, y: 54.5, scale: 1 }
const TALL = { x: 50, y: 51.8, scale: 13.9 / 10.1 }

const src = (f: Fotka) => urlFor(f).width(typeof window !== "undefined" && window.innerWidth < 768 ? 1200 : 1800).auto("format").quality(80).url()

// Fotky jedné varianty: první hned, zbytek s nízkou prioritou (nejdřív každá 6. pro hrubé otáčení).
type Sequence = { imgs: (HTMLImageElement | null)[]; restStarted: boolean; listeners: Set<() => void> }
const sequences = new Map<string, Sequence>()
// Jakmile návštěvník jednou otočil, další varianty se stahují rovnou celé
let interacted = false

function sequence(id: string, n: number) {
    let seq = sequences.get(id)
    if (!seq) {
        seq = { imgs: Array(n).fill(null), restStarted: false, listeners: new Set() }
        sequences.set(id, seq)
    }
    // poprvé může přijít jen fotka z karty vozu (n = 1), s detailem varianty pak všechny
    if (seq.imgs.length < n) seq.imgs = [...seq.imgs, ...Array(n - seq.imgs.length).fill(null)]
    return seq
}
function loadImage(seq: Sequence, i: number, f: Fotka, priority: "high" | "low") {
    const im = new Image()
    im.fetchPriority = priority
    im.src = src(f)
    im.decode().then(() => {
        seq.imgs[i] = im
        seq.listeners.forEach((l) => l())
    }, () => {})
}
async function loadRest(seq: Sequence, slug: string, varianta: Varianta) {
    if (seq.restStarted) return
    seq.restStarted = true
    const res = await fetch(`/api/fotky?slug=${encodeURIComponent(slug)}&varianta=${encodeURIComponent(varianta._key)}`)
    if (!res.ok) {
        seq.restStarted = false
        return
    }
    const rest: Fotka[] = await res.json()
    rest.map((f, j) => [f, j + 1] as const)
        .sort(([, a], [, b]) => (a % 6 === 0 ? 0 : 1) - (b % 6 === 0 ? 0 : 1))
        .forEach(([f, i]) => loadImage(seq, i, f, "low"))
}
// nejbližší už stažený snímek, aby se při otáčení nikdy nekreslilo prázdno
function nearest(seq: Sequence, i: number) {
    const n = seq.imgs.length
    for (let d = 0; d <= n / 2; d++) {
        const a = seq.imgs[(i + d) % n] ?? seq.imgs[(i - d + n) % n]
        if (a) return a
    }
    return null
}

export type CarViewerHandle = { rotate: (deg: number) => void }

export default function CarViewer({
    slug,
    varianta,
    geometrie,
    nazev,
    ref,
}: {
    slug: string
    varianta: Varianta
    geometrie: Geometrie
    nazev: string
    ref?: Ref<CarViewerHandle>
}) {
    const canvas = useRef<HTMLCanvasElement>(null)
    const box = useRef<HTMLDivElement>(null)
    // úhel se drží napříč barvami a verzemi, ať se auto při přepnutí neotočí zpátky
    const angle = useRef({ a: 0 })
    const target = useRef(0)
    const to = useRef<gsap.QuickToFunc | null>(null)
    const drag = useRef<{ x: number; a: number; lastX: number; lastT: number; v: number } | null>(null)
    const id = `${slug}:${varianta._key}`
    const n = Math.max(varianta.pocetFotek, 1)
    // objekt varianty se mění s každým načtením detailu, efekt se řídí jen jejím id
    const v = useRef(varianta)
    useEffect(() => {
        v.current = varianta
    })

    useEffect(() => {
        const cv = canvas.current!
        const ctx = cv.getContext("2d")!
        const ang = angle.current
        const seq = sequence(id, n)
        let shown = -1
        let drawn: HTMLImageElement | null = null
        const draw = (force = false) => {
            const step = 360 / n
            const i = (((Math.round(ang.a / step) % n) + n) % n)
            if (!force && i === shown) return
            const im = nearest(seq, i)
            shown = seq.imgs[i] ? i : -1
            if (!force && im === drawn) return
            drawn = im
            ctx.clearRect(0, 0, cv.width, cv.height)
            if (im) ctx.drawImage(im, 0, 0, cv.width, cv.height)
        }
        const onLoad = () => draw(true)
        seq.listeners.add(onLoad)
        if (!seq.imgs[0] && v.current.foto) loadImage(seq, 0, v.current.foto, "high")
        if (interacted && n > 1) loadRest(seq, slug, v.current)

        const ro = new ResizeObserver(() => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            cv.width = Math.round(cv.clientWidth * dpr)
            cv.height = Math.round(cv.clientHeight * dpr)
            draw(true)
        })
        ro.observe(cv)

        to.current = gsap.quickTo(ang, "a", { duration: 0.6, ease: "power3.out", onUpdate: () => draw() })
        draw(true)
        gsap.fromTo(box.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "expo.out" })
        return () => {
            seq.listeners.delete(onLoad)
            ro.disconnect()
            gsap.killTweensOf(ang)
        }
    }, [id, n, slug])

    const startRest = () => {
        interacted = true
        if (n > 1) loadRest(sequence(id, n), slug, v.current)
    }
    const rotate = (deg: number) => {
        startRest()
        target.current += deg
        to.current?.(target.current)
    }
    useImperativeHandle(ref, () => ({ rotate: (deg) => rotate(deg) }))

    const onDown = (e: PointerEvent<HTMLDivElement>) => {
        startRest()
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
        // stejná plocha jako video (16:9, na výšku 9:16), aby procenta seděla na koberec
        <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2 portrait:aspect-[9/16] portrait:w-[max(100vw,56.25vh)]">
            <div
                ref={box}
                className="pointer-events-auto absolute left-(--wx) top-(--wy) w-(--ww) cursor-grab touch-pan-y select-none active:cursor-grabbing portrait:left-(--tx) portrait:top-(--ty) portrait:w-(--tw)"
                style={{
                    "--wx": `${WIDE.x}%`,
                    "--wy": `${WIDE.y}%`,
                    "--ww": `${geometrie.widthPct * WIDE.scale}%`,
                    "--tx": `${TALL.x}%`,
                    "--ty": `${TALL.y}%`,
                    "--tw": `${geometrie.widthPct * TALL.scale}%`,
                    aspectRatio: IMG_RATIO,
                    transform: `translate(-50%, -${geometrie.groundY * 100}%)`,
                } as CSSProperties}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
            >
                <canvas ref={canvas} role="img" aria-label={`Toyota ${nazev}, otočná fotka`} className="h-full w-full" />
            </div>
        </div>
    )
}
