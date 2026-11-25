"use client"

import { useEffect, useRef, useState } from "react"

import { konecPruletu } from "@/components/ScrollVideo"

// Průvodkyně Petra (Figma „Animace · … s průvodkyní Petrou“ 363:1245 / 363:2704). Klipy v public/video/petra
// generuje petra_web.py: nahoře barva (premultiplied), dole alfa, za větou klidová smyčka. Průhlednost
// skládá WebGL, protože VP9 alfu neumí Safari a HEVC alfu ostatní prohlížeče.
export type Scena = 1 | 2 | 3 | 4 | 5 | 6
type Klip = { soubor: string; veta: number; radky: string[]; strana: "vlevo" | "vpravo" | "stred" }

const KLIPY: Record<Scena, Klip> = {
    1: { soubor: "1", veta: 3.62, radky: ["Dobrý den, jsem Petra!", "Provedu vás naším showroomem."], strana: "vlevo" },
    2: { soubor: "2", veta: 2.58, radky: ["Vpravo najdete celou", "nabídku našich vozů."], strana: "vlevo" },
    3: { soubor: "3", veta: 1.79, radky: ["Vyberte si model,", "třeba RAV4."], strana: "vpravo" },
    4: { soubor: "4", veta: 1.54, radky: ["Teď už jen zvolit verzi."], strana: "vpravo" },
    5: { soubor: "5", veta: 2.25, radky: ["Krásná volba!", "Stačí ji poptat."], strana: "vpravo" },
    6: { soubor: "6", veta: 1.83, radky: ["Vyplňte kontakt", "a já se vám ozvu."], strana: "stred" },
}
// na mobilu je nabídka dole, ne vpravo
const KLIP_2_MOBIL: Klip = { soubor: "2m", veta: 1.92, radky: ["Najdete tu celou", "nabídku našich vozů."], strana: "vlevo" }

// Jak dlouho po větě zůstane (s). V nabídce vozů na šířku má volné místo, jinde by překážela obsahu.
const DOZNENI = 2.5
// Celá postava, když je na ni místo; jinak kulatý avatar s bublinou
const POSTAVA = "(min-width: 768px) and (min-height: 600px)"
const ULOZIT = { skryta: "petra-skryta", zvuk: "petra-zvuk" }

const cti = (k: string) => {
    try {
        return localStorage.getItem(k) === "1"
    } catch {
        return false
    }
}
const zapis = (k: string, v: boolean) => {
    try {
        localStorage.setItem(k, v ? "1" : "0")
    } catch {}
}

export default function Pruvodkyne({ scena: zNabidky }: { scena: Exclude<Scena, 1> }) {
    const [oblast, setOblast] = useState<"uvod" | "prulet" | "nabidka">("uvod")
    const [postava, setPostava] = useState<boolean | null>(null)
    const [skryta, setSkryta] = useState(true)
    const [zvuk, setZvuk] = useState(false)
    const [klid, setKlid] = useState(false)
    const [hraje, setHraje] = useState<Scena | null>(null)
    const [viditelna, setViditelna] = useState(false)
    const [mluvi, setMluvi] = useState(false)
    const [bezVidea, setBezVidea] = useState(false)
    const [dole, setDole] = useState(0)
    const obal = useRef<HTMLDivElement>(null)
    const canvas = useRef<HTMLCanvasElement>(null)
    const video = useRef<HTMLVideoElement>(null)
    const rekla = useRef(new Set<Scena>())
    const zvukRef = useRef(false)

    useEffect(() => {
        const mq = window.matchMedia(POSTAVA)
        const nastav = () => setPostava(mq.matches)
        const start = requestAnimationFrame(() => {
            nastav()
            setSkryta(cti(ULOZIT.skryta))
            zvukRef.current = cti(ULOZIT.zvuk)
            setZvuk(zvukRef.current)
            setKlid(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        })
        mq.addEventListener("change", nastav)
        return () => {
            cancelAnimationFrame(start)
            mq.removeEventListener("change", nastav)
        }
    }, [])

    // kde v průletu návštěvník je (prahy podle časové osy ve ScrollVideo)
    useEffect(() => {
        const onScroll = () => {
            const p = window.scrollY / Math.max(konecPruletu(), 1)
            setOblast(p < 0.08 ? "uvod" : p < 0.7 ? "prulet" : "nabidka")
        }
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const scena: Scena | null = oblast === "uvod" ? null : oblast === "prulet" ? 1 : zNabidky
    const aktivni = !skryta && postava !== null
    const klip = hraje === 2 && !postava ? KLIP_2_MOBIL : hraje ? KLIPY[hraje] : null

    // Přechod na novou scénu. Přivítání se nechá dopovědět, i když průlet mezitím dojel k nabídce.
    useEffect(() => {
        if (!aktivni || scena === hraje) return
        if (hraje === 1 && scena === 2 && mluvi) return
        const t = setTimeout(
            () => {
                if (scena === null || rekla.current.has(scena)) {
                    setViditelna(false)
                    setMluvi(false)
                    setHraje(scena)
                    return
                }
                const cil = scena === 5 ? "[data-lista]" : scena === 2 && !postava ? "[data-reveal-panel]" : null
                const el = cil ? document.querySelector<HTMLElement>(cil) : null
                setDole(el && obal.current ? obal.current.offsetHeight - el.offsetTop : 0)
                rekla.current.add(scena)
                setHraje(scena)
                setViditelna(true)
                setMluvi(true)
            },
            // panely přijíždějí 700 ms, Petra až po nich; odchod hned
            scena === null ? 0 : scena === 1 ? 150 : 650,
        )
        if (viditelna && hraje !== 1) setTimeout(() => setViditelna(false), 0)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- viditelna jen schová předchozí scénu
    }, [aktivni, scena, hraje, mluvi, postava])

    // Přehrání klipu a průhlednost
    useEffect(() => {
        const v = video.current
        const c = canvas.current
        if (!klip || !viditelna || !v || !c || klid) return
        const kresli = pripravGl(c)
        let snimek = 0
        let konec = false
        const smycka = () => {
            if (konec) return
            if (v.readyState >= 2) {
                kresli?.(v)
                // klidová smyčka za větou
                if (v.duration && v.currentTime > v.duration - 0.06) v.currentTime = klip.veta + 0.5
            }
            snimek = requestAnimationFrame(smycka)
        }
        v.src = `/video/petra/${klip.soubor}.mp4`
        v.muted = !zvukRef.current
        const hrej = () =>
            v.play().catch(() => {
                if (konec) return
                // zvuk bez kliknutí prohlížeč nepustí → potichu; v úsporném režimu jen fotka
                v.muted = true
                return v.play().catch(() => !konec && setBezVidea(true))
            })
        hrej()
        smycka()
        return () => {
            konec = true
            cancelAnimationFrame(snimek)
            v.pause()
        }
    }, [klip, viditelna, klid])

    // Konec věty a odchod
    useEffect(() => {
        if (!klip || !viditelna) return
        const t1 = setTimeout(() => setMluvi(false), klip.veta * 1000 + 300)
        const zustane = hraje === 2 && postava
        const t2 = zustane ? undefined : setTimeout(() => setViditelna(false), (klip.veta + DOZNENI) * 1000)
        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
        }
    }, [klip, viditelna, hraje, postava])

    const prepniZvuk = () => {
        const novy = !zvuk
        setZvuk(novy)
        zvukRef.current = novy
        zapis(ULOZIT.zvuk, novy)
        const v = video.current
        if (!v) return
        v.muted = !novy
        if (novy && klip) {
            // větu zopakovat od začátku, ať ji návštěvník slyší celou
            v.currentTime = 0
            v.play().catch(() => {})
        }
    }
    const schovej = () => {
        setViditelna(false)
        setSkryta(true)
        zapis(ULOZIT.skryta, true)
    }

    const strana = klip?.strana ?? "vlevo"
    const obraz = (
        <>
            {(bezVidea || klid) && (
                // eslint-disable-next-line @next/next/no-img-element -- malá statická záloha
                <img src="/video/petra/petra.webp" alt="" className="absolute inset-0 size-full" />
            )}
            <canvas ref={canvas} width={450} height={624} className="absolute inset-0 size-full" />
        </>
    )
    const bublina = klip && (
        <div className={`pointer-events-auto relative w-max rounded-[18px] bg-white text-ink shadow-[0_12px_32px_rgb(0_0_0/0.22)] ${postava ? "px-5 py-3.5" : "py-3 pl-10 pr-4"}`}>
            <p className="flex items-center gap-1.5 pr-16 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2">
                <span aria-hidden className="size-2 rounded-full bg-red" />
                Petra · průvodkyně
            </p>
            <p className="mt-1 font-body text-[16px] font-bold leading-[1.3] md:text-xl">
                {klip.radky.map((r) => (
                    <span key={r} className="block">
                        {r}
                    </span>
                ))}
            </p>
            <div className="absolute right-1 top-0.5 flex">
                <button onClick={prepniZvuk} aria-pressed={zvuk} aria-label={zvuk ? "Vypnout hlas Petry" : "Zapnout hlas Petry"} className="flex size-9 items-center justify-center text-ink-2 hover:text-ink">
                    <IkonaZvuku zapnuto={zvuk} />
                </button>
                <button onClick={schovej} aria-label="Skrýt průvodkyni" className="flex size-9 items-center justify-center font-mono text-lg text-ink-2 hover:text-ink">
                    ×
                </button>
            </div>
        </div>
    )

    return (
        <div ref={obal} className="pointer-events-none absolute inset-0 overflow-hidden">
            <video ref={video} playsInline preload="auto" aria-hidden tabIndex={-1} className="absolute size-px opacity-0" />
            {aktivni &&
                (postava ? (
                    <div
                        inert={!viditelna}
                        className={`absolute h-[312px] w-[225px] transition-[translate,opacity,visibility] duration-500 ${viditelna ? "ease-[cubic-bezier(0.34,1.3,0.64,1)]" : "invisible translate-y-[340px] opacity-0 ease-in"} ${strana === "vlevo" ? "left-4" : strana === "vpravo" ? "right-4" : "left-4 xl:left-[calc(50%-128px)]"}`}
                        style={{ bottom: dole, clipPath: "inset(-400px -700px 0 -700px)" }}
                    >
                        <div className="absolute inset-0 drop-shadow-[0_12px_20px_rgb(0_0_0/0.22)]">{obraz}</div>
                        <div className={`absolute ${hraje === 5 ? "bottom-full right-0 -mb-2" : hraje === 6 ? "bottom-full left-0 -mb-2 xl:left-auto xl:right-0" : strana === "vpravo" ? "right-[215px] top-16" : "bottom-full left-0 -mb-2 xl:bottom-auto xl:left-[215px] xl:top-2"}`}>{bublina}</div>
                    </div>
                ) : (
                    <div
                        inert={!viditelna}
                        className={`absolute left-3.5 transition-[translate,scale,opacity,visibility] duration-300 ${viditelna ? "ease-[cubic-bezier(0.34,1.45,0.64,1)]" : "invisible translate-y-4 scale-[0.92] opacity-0"}`}
                        style={{ bottom: hraje === 6 ? 168 : dole + 14 }}
                    >
                        <div className="ml-10 mt-2.5">{bublina}</div>
                        <div className="absolute left-0 top-0 size-[68px] overflow-hidden rounded-full border-[3px] border-red bg-[radial-gradient(#fff,#d4d4d1)] shadow-[0_8px_18px_rgb(0_0_0/0.3)]">
                            {/* výřez hlavy: v klipu 1080×1500 čtverec 700 px od (245; 40) */}
                            <div className="absolute -left-[21.7px] -top-[3.5px] h-[132.9px] w-[95.7px]">{obraz}</div>
                        </div>
                    </div>
                ))}
            <p aria-live="polite" className="sr-only">
                {viditelna && klip ? `Petra: ${klip.radky.join(" ")}` : ""}
            </p>
        </div>
    )
}

function IkonaZvuku({ zapnuto }: { zapnuto: boolean }) {
    return (
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4z" />
            {zapnuto ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 6 6m0-6-6 6" />}
        </svg>
    )
}

// Složí klip (nahoře barva, dole alfa) do průhledného canvasu. Vrací funkci na vykreslení snímku.
function pripravGl(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true })
    if (!gl) return null
    const shader = (typ: number, zdroj: string) => {
        const s = gl.createShader(typ)!
        gl.shaderSource(s, zdroj)
        gl.compileShader(s)
        return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, shader(gl.VERTEX_SHADER, "attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}"))
    gl.attachShader(
        p,
        shader(
            gl.FRAGMENT_SHADER,
            "precision mediump float;varying vec2 v;uniform sampler2D t;void main(){float y=clamp(v.y,.002,.998)*.5;float a=texture2D(t,vec2(v.x,y+.5)).r;a=clamp((a-.03)/.95,0.,1.);vec3 c=texture2D(t,vec2(v.x,y)).rgb;gl_FragColor=vec4(min(c,vec3(a)),a);}",
        ),
    )
    gl.linkProgram(p)
    gl.useProgram(p)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const a = gl.getAttribLocation(p, "a")
    gl.enableVertexAttribArray(a)
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    for (const [k, h] of [
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
    ])
        gl.texParameteri(gl.TEXTURE_2D, k, h)
    return (v: HTMLVideoElement) => {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}
