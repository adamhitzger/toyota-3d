import Link from "next/link"
import { ReactNode } from "react"

import Menu from "@/components/web/Menu"
import { ADRESA, FIRMA } from "@/lib/firma"

const ODKAZY = [
    { href: "/", text: "Showroom" },
    { href: "/kontakt", text: "Kontakt" },
]

// Hlavička + patička podstránek (Figma 189:1230 / 190:1230). aktivni = href zvýrazněné položky.
export function Ramec({ aktivni, children }: { aktivni?: string; children: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col bg-paper text-ink">
            <header className="flex items-center justify-between gap-4 border-b-[1.5px] border-ink px-4 py-2 md:px-16 md:py-3.5">
                <Link href="/" className="whitespace-nowrap font-display text-[14px] font-black uppercase tracking-[-0.02em] md:text-[19px]">
                    {FIRMA.znacka}
                </Link>
                <div className="flex items-center gap-9">
                    <nav aria-label="Hlavní" className="hidden items-center gap-9 md:flex">
                        {ODKAZY.map((o) => (
                            <Link
                                key={o.href}
                                href={o.href}
                                aria-current={o.href === aktivni ? "page" : undefined}
                                className="flex items-center gap-2 font-mono text-[13px] uppercase text-ink-2 hover:text-ink aria-[current=page]:text-ink"
                            >
                                {o.href === aktivni && <span aria-hidden className="size-2 bg-red" />}
                                {o.text}
                            </Link>
                        ))}
                    </nav>
                    {/* na mobilu jediná navigace, na desktopu navíc odkaz na zpracování osobních údajů */}
                    <Menu />
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="flex flex-col gap-6 bg-ink px-4 py-8 text-on-ink md:flex-row md:items-start md:justify-between md:gap-12 md:px-16 md:py-11">
                <div className="flex flex-col gap-2">
                    <p className="font-display text-[17px] font-black uppercase tracking-[-0.02em]">{FIRMA.znacka}</p>
                    <p className="text-[15px] text-on-ink-2">{ADRESA}</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
                    <Link href="/kontakt" className="font-mono text-[13px] uppercase hover:underline">
                        Kontakt
                    </Link>
                    <Link href="/zpracovani-osobnich-udaju" className="font-mono text-[13px] uppercase hover:underline">
                        Zpracování osobních údajů
                    </Link>
                    <p className="font-mono text-xs text-on-ink-2">© 2026 {FIRMA.znacka}</p>
                </div>
            </footer>
        </div>
    )
}

// Popisek sekce „[ … ]“ a velký nadpis stránky
export function Nadpis({ stitek, children, className = "" }: { stitek: string; children: ReactNode; className?: string }) {
    return (
        <div className="flex flex-col gap-3.5 md:gap-5">
            <p className="font-mono text-[13px] text-ink-2">[ {stitek} ]</p>
            <h1 className={`font-display font-black uppercase leading-[0.92] tracking-[-0.035em] ${className}`}>{children}</h1>
        </div>
    )
}
