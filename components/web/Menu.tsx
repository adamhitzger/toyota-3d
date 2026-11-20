"use client"

import { useLenis } from "lenis/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { ADRESA, FIRMA } from "@/lib/firma"

const ODKAZY = [
    { href: "/", text: "Showroom" },
    { href: "/kontakt", text: "Kontakt" },
    { href: "/zpracovani-osobnich-udaju", text: "Zpracování osobních údajů" },
]

const prechod = "transition-[translate,opacity,visibility] duration-700 ease-expo motion-reduce:duration-0"
const tlacitko = "flex size-11 shrink-0 flex-col items-center justify-center gap-[5px] border"

// Burger menu: tlačítko 44×44 a přes celou obrazovku tmavý panel s odkazy na stránky.
// Na úvodní stránce plave nad videem, na podstránkách je v hlavičce (Ramec).
export default function Menu({ className = "" }: { className?: string }) {
    const [otevreno, setOtevreno] = useState(false)
    const id = useId()
    const otevrit = useRef<HTMLButtonElement>(null)
    const zavrit = useRef<HTMLButtonElement>(null)
    const cesta = usePathname()
    const lenis = useLenis()

    // zamknout scroll (Lenis na úvodní stránce, jinak body), Esc zavírá, fokus do panelu a zpátky
    useEffect(() => {
        if (!otevreno) return
        lenis?.stop()
        const puvodni = document.body.style.overflow
        document.body.style.overflow = "hidden"
        // panel je v prvním snímku přechodu ještě visibility:hidden, fokus až o snímek později
        const snimek = requestAnimationFrame(() => requestAnimationFrame(() => zavrit.current?.focus()))
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOtevreno(false)
        window.addEventListener("keydown", onKey)
        const tlacitkoMenu = otevrit.current
        return () => {
            cancelAnimationFrame(snimek)
            lenis?.start()
            document.body.style.overflow = puvodni
            window.removeEventListener("keydown", onKey)
            tlacitkoMenu?.focus()
        }
    }, [otevreno, lenis])

    return (
        <>
            <button
                ref={otevrit}
                type="button"
                onClick={() => setOtevreno(true)}
                aria-expanded={otevreno}
                aria-controls={id}
                aria-label="Otevřít menu"
                className={`${tlacitko} pointer-events-auto border-ink bg-panel hover:bg-paper-2 ${className}`}
            >
                <span aria-hidden className="h-[1.5px] w-5 bg-ink" />
                <span aria-hidden className="h-[1.5px] w-5 bg-ink" />
                <span aria-hidden className="h-[1.5px] w-5 bg-ink" />
            </button>

            <div
                id={id}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                inert={!otevreno}
                className={`pointer-events-auto fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink text-on-ink ${prechod} ${otevreno ? "" : "invisible -translate-y-4 opacity-0"}`}
            >
                <div className="flex items-center justify-between gap-4 border-b border-on-ink/25 px-4 py-3.5 md:px-16 md:py-[22px]">
                    <Link
                        href="/"
                        onClick={() => setOtevreno(false)}
                        className="whitespace-nowrap font-display text-[14px] font-black uppercase tracking-[-0.02em] md:text-[19px]"
                    >
                        {FIRMA.znacka}
                    </Link>
                    <button
                        ref={zavrit}
                        type="button"
                        onClick={() => setOtevreno(false)}
                        aria-label="Zavřít menu"
                        className={`${tlacitko} border-on-ink font-mono text-xl hover:bg-on-ink hover:text-ink`}
                    >
                        ×
                    </button>
                </div>

                <nav aria-label="Menu" className="flex-1 px-4 md:px-16">
                    <ul>
                        {ODKAZY.map((o, i) => {
                            const aktivni = o.href === cesta
                            return (
                                <li key={o.href} className="border-b border-on-ink/25">
                                    <Link
                                        href={o.href}
                                        onClick={() => setOtevreno(false)}
                                        aria-current={aktivni ? "page" : undefined}
                                        className="group flex items-baseline gap-4 py-6 md:gap-8 md:py-9"
                                    >
                                        <span className="w-6 shrink-0 font-mono text-[13px] text-on-ink-2 md:w-8">0{i + 1}</span>
                                        <span className="font-display text-[32px] font-black uppercase leading-[0.95] tracking-[-0.035em] transition-transform duration-500 ease-expo group-hover:translate-x-2 motion-reduce:transition-none md:text-[72px]">
                                            {o.text}
                                        </span>
                                        {aktivni && <span aria-hidden className="size-2.5 shrink-0 self-center bg-red md:size-3.5" />}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <div className="flex flex-col gap-2 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 font-mono text-[13px] uppercase text-on-ink-2 md:flex-row md:gap-10 md:px-16 md:pb-11">
                    <p>{ADRESA}</p>
                    <a href={`tel:${FIRMA.telefonProdej.replace(/\s/g, "")}`} className="hover:text-on-ink">
                        {FIRMA.telefonProdej}
                    </a>
                    <a href={`mailto:${FIRMA.email}`} className="normal-case hover:text-on-ink">
                        {FIRMA.email}
                    </a>
                </div>
            </div>
        </>
    )
}
