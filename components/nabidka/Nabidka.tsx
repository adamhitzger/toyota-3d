"use client"

import { useLenis } from "lenis/react"
import { useEffect, useRef, useState } from "react"

import CarViewer, { type CarViewerHandle, type Geometrie, type Varianta } from "@/components/CarViewer"
import { konecPruletu } from "@/components/ScrollVideo"
import type { VUZ_QUERY_RESULT } from "@/sanity.types"
import type { Nabidka as Data } from "@/sanity/lib/nabidka"

import OvladaniVozu from "./OvladaniVozu"
import PanelNabidka from "./PanelNabidka"
import Poptavka from "./Poptavka"
import Pruvodkyne from "./Pruvodkyne"
import SeznamVozu from "./SeznamVozu"
import { cena, pohon, type Kategorie } from "./texty"
import { Stitek, Zavrit } from "./ui"

type Detail = NonNullable<VUZ_QUERY_RESULT>

// Rozměr auta na fotkách z konfigurátoru podle modelu (viz Geometrie v CarViewer). Pro nový model
// bez měření se použije výchozí hodnota, která sedí na SUV střední velikosti.
const GEOMETRIE: Record<string, Geometrie> = {
    rav4: { widthPct: 56, groundY: 0.76 },
    hilux: { widthPct: 77, groundY: 0.69 },
}
const VYCHOZI_GEOMETRIE: Geometrie = { widthPct: 58, groundY: 0.75 }

// Přechody stavů (DESIGN.md · Motion): ease-out expo 700 ms, skryté vrstvy jsou inert
const prechod = "transition-[translate,opacity,visibility] duration-700 ease-expo motion-reduce:duration-0"

// Vrstva nad videem po zastavení průletu (Figma „Animace · Desktop“ 112:192 / „Mobil“ 112:296):
// Nabídka vozů → Modely kategorie → verze modelu → auto na koberci → poptávka.
export default function Nabidka({ data }: { data: Data }) {
    const [kategorie, setKategorie] = useState<Kategorie>("modely")
    const [modelId, setModelId] = useState<string | null>(null)
    const [seznam, setSeznam] = useState(false)
    const [slug, setSlug] = useState<string | null>(null)
    const [poptavka, setPoptavka] = useState(false)
    // každé otevření poptávky začíná s čistým formulářem
    const [otevreniPoptavky, setOtevreniPoptavky] = useState(0)
    const [barvaKey, setBarvaKey] = useState<string>()
    const [detaily, setDetaily] = useState<Record<string, Detail>>({})
    const viewer = useRef<CarViewerHandle>(null)

    const karta = slug ? data.vozy.find((v) => v.slug === slug) : undefined
    const detail = slug ? detaily[slug] : undefined

    // detail vozu (všechny barvy + verze modelu) se dotahuje až při výběru
    useEffect(() => {
        if (!slug || detaily[slug]) return
        let zruseno = false
        fetch(`/api/vuz?slug=${encodeURIComponent(slug)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d: Detail | null) => {
                if (d && !zruseno) setDetaily((x) => ({ ...x, [d.slug]: d }))
            })
            .catch(() => {})
        return () => {
            zruseno = true
        }
    }, [slug, detaily])

    // dokud detail nedorazí, stačí hlavní fotky barev z karty vozu
    const varianty: Varianta[] =
        detail?.varianty ??
        (karta?.barvy.map((b) => ({ ...b, foto: b.foto ?? karta.foto, pocetFotek: 1 })) ?? [])
    const barva = varianty.find((v) => v._key === barvaKey) ?? varianty[0]
    const verzeModelu = detail?.verzeModelu ?? (karta ? [{ _id: karta._id, nazev: karta.nazev, verze: karta.verze, slug: karta.slug, cenaOd: karta.cenaOd }] : [])
    const vozyModelu = karta ? data.vozy.filter((v) => v.model._id === karta.model._id && v.kategorie === karta.kategorie) : []

    const vyberVuz = (s: string) => {
        // barvu podle názvu přenést na jinou verzi, pokud ji má
        const nazevBarvy = barva?.nazevBarvy
        const novy = data.vozy.find((v) => v.slug === s)
        setBarvaKey(novy?.barvy.find((b) => b.nazevBarvy === nazevBarvy)?._key)
        setSlug(s)
        setSeznam(false)
    }

    // Otevřený panel nebo poptávka: stránka se nesmí posouvat (jinak by se rozjelo video)
    const lenis = useLenis()
    const zamceno = seznam || poptavka
    useEffect(() => {
        if (!lenis) return
        if (zamceno) lenis.stop()
        else lenis.start()
    }, [lenis, zamceno])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            if (poptavka) setPoptavka(false)
            else if (seznam) setSeznam(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [poptavka, seznam])

    // Návrat průletem zpět pod polovinu: příští příjezd začíná zase úvodní nabídkou vozů
    const vybrano = slug !== null || modelId !== null || kategorie !== "modely"
    useEffect(() => {
        if (!vybrano) return
        const onScroll = () => {
            if (window.scrollY >= konecPruletu() / 2) return
            setSlug(null)
            setBarvaKey(undefined)
            setModelId(null)
            setKategorie("modely")
            setSeznam(false)
            setPoptavka(false)
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [vybrano])

    const autoVidet = !!karta && !seznam
    const panelVidet = !slug

    return (
        <>
        <div data-reveal className="invisible absolute inset-0">
            {/* auto na koberci */}
            {karta && barva && (
                <div inert={!autoVidet} className={`${prechod} ${autoVidet ? "opacity-100" : "invisible translate-x-12 opacity-0"}`}>
                    <CarViewer
                        ref={viewer}
                        slug={karta.slug}
                        varianta={barva}
                        geometrie={GEOMETRIE[karta.model.slug] ?? VYCHOZI_GEOMETRIE}
                        nazev={karta.nazev}
                    />
                </div>
            )}

            {/* název vozu na mobilu; od md je u lišty pod autem, aby nekryl banner prodejny ve videu */}
            {karta && (
                <div
                    inert={!autoVidet}
                    className={`absolute left-4 top-[72px] flex max-w-[calc(100%-32px)] flex-col gap-0.5 border border-ink bg-panel px-3.5 py-3 md:hidden ${prechod} ${autoVidet ? "" : "invisible -translate-y-4 opacity-0"}`}
                >
                    <Stitek>
                        [ {karta.model.nazev} · {pohon(karta.typMotoru)} ]
                    </Stitek>
                    <h2 className="font-display text-[32px] font-black uppercase leading-[0.95] tracking-[-0.035em] text-ink">{karta.nazev}</h2>
                    <p className="font-body text-[15px] font-bold text-ink">od {cena(karta.cenaOd)}</p>
                </div>
            )}

            {/* ovládání vozu (Figma 122:719) */}
            {karta && (
                <div
                    data-lista
                    inert={!autoVidet}
                    className={`absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] xl:inset-x-auto xl:bottom-6 xl:left-1/2 xl:w-max xl:max-w-[calc(100vw-48px)] xl:-translate-x-1/2 ${prechod} ${autoVidet ? "" : "invisible translate-y-6 opacity-0"}`}
                >
                    <div className="pointer-events-auto hidden items-end justify-between gap-6 border border-b-0 border-ink bg-panel px-3.5 py-3 md:flex xl:gap-10 xl:px-5 xl:py-4 [@media(max-height:500px)]:py-2">
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <Stitek className="[@media(max-height:500px)]:hidden">
                                [ {karta.model.nazev} · {pohon(karta.typMotoru)} ]
                            </Stitek>
                            <h2 className="font-display text-[26px] font-black uppercase leading-[0.95] tracking-[-0.035em] text-ink xl:text-[48px]">{karta.nazev}</h2>
                        </div>
                        <p className="flex shrink-0 flex-col gap-1.5">
                            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2 xl:text-[13px] [@media(max-height:500px)]:hidden">Cena od</span>
                            <span className="font-display text-[22px] font-black leading-[0.95] tracking-[-0.02em] text-ink xl:text-[38px]">{cena(karta.cenaOd)}</span>
                        </p>
                    </div>
                    <OvladaniVozu
                        varianty={varianty}
                        barva={barva}
                        onBarva={setBarvaKey}
                        verze={verzeModelu}
                        slug={karta.slug}
                        onVerze={vyberVuz}
                        onOtocit={(deg) => viewer.current?.rotate(deg)}
                        onPoptat={() => {
                            setOtevreniPoptavky((n) => n + 1)
                            setPoptavka(true)
                        }}
                        onModely={() => {
                            setKategorie(karta.kategorie)
                            setModelId(null)
                            setSeznam(true)
                        }}
                        onNabidka={() => setSlug(null)}
                    />
                </div>
            )}

            {/* panel Nabídka vozů: vjezd řídí scroll (data-reveal-panel), odjezd výběr vozu. Obal nesmí
                chytat ťuknutí: po výběru vozu zůstává na místě a překrýval by ovládání vozu. */}
            <div data-reveal-panel className="pointer-events-none absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-[61px] md:right-6 md:top-[61px] md:w-[456px]">
                <div inert={!panelVidet} className={`pointer-events-auto h-full ${prechod} ${panelVidet ? "" : "invisible translate-y-8 opacity-0 md:translate-x-[calc(100%+24px)] md:translate-y-0"}`}>
                    <PanelNabidka
                        onVyber={(k) => {
                            setKategorie(k)
                            setModelId(null)
                            setSeznam(true)
                        }}
                    />
                </div>
            </div>

            {/* vysouvací panel Modely / verze (Figma 118:324 / 118:556) */}
            <div
                inert={!seznam}
                role="dialog"
                aria-modal="true"
                aria-label="Nabídka vozů"
                className={`absolute inset-x-0 bottom-0 top-16 border-t border-ink bg-paper md:top-24 ${prechod} ${seznam ? "" : "invisible translate-y-full"}`}
            >
                <Zavrit onClick={() => setSeznam(false)} />
                <div data-lenis-prevent className="h-full overflow-y-auto overscroll-contain px-4 pb-8 pt-4 md:px-16 md:pb-16 md:pt-10">
                    <SeznamVozu
                        kategorie={kategorie}
                        modely={data.modely[kategorie]}
                        vozy={data.vozy}
                        modelId={modelId}
                        onModel={setModelId}
                        onVuz={vyberVuz}
                    />
                </div>
            </div>

            {/* poptávka (Figma 128:693 / 128:769) */}
            <div
                aria-hidden
                onClick={() => setPoptavka(false)}
                className={`absolute inset-0 bg-ink/50 transition-opacity duration-500 ${poptavka ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            <div inert={!poptavka} className={`pointer-events-none absolute inset-0 ${prechod} ${poptavka ? "" : "invisible translate-y-full"}`}>
                {karta && (
                    <Poptavka
                        key={otevreniPoptavky}
                        vuz={karta}
                        verze={vozyModelu}
                        barvaKey={barvaKey ?? barva?._key}
                        onVuz={vyberVuz}
                        onBarva={setBarvaKey}
                        onZavrit={() => setPoptavka(false)}
                    />
                )}
            </div>
        </div>
        <Pruvodkyne scena={poptavka ? 6 : seznam ? (modelId ? 4 : 3) : slug ? 5 : 2} />
        </>
    )
}
