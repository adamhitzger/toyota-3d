import Image from "next/image"
import { ButtonHTMLAttributes, ReactNode } from "react"

import type { Fotka } from "@/components/CarViewer"
import { urlFor } from "@/sanity/lib/image"

// Fotka vozu ze Sanity na podkladu paper-2 (Figma: vrstva „Foto“ s object-contain).
// width = šířka v CSS px, 2× pro retinu přes srcset.
export function Foto({ foto, width, alt = "", className = "" }: { foto: Fotka | null; width: number; alt?: string; className?: string }) {
    const url = (w: number) => (foto ? urlFor(foto).width(w).auto("format").quality(80).url() : undefined)
    return (
        <div className={`relative bg-paper-2 ${className}`}>
            {foto && (
                // eslint-disable-next-line @next/next/no-img-element -- velikost řeší image pipeline Sanity
                <img
                    src={url(width)}
                    srcSet={`${url(width)} 1x, ${url(width * 2)} 2x`}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-contain"
                />
            )}
        </div>
    )
}

// Tlačítko „Inkoust“ (Figma 23:204): výška 56, popisek mono 15, šipka v červeném čtverci 44
export function Tlacitko({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
    return (
        <button
            {...props}
            className={`group flex h-14 w-full items-center justify-between bg-ink pl-6 pr-1.5 font-mono text-[15px] leading-[1.2] tracking-[0.08em] text-on-ink transition-transform active:scale-[0.98] disabled:opacity-50 ${className}`}
        >
            {children}
            <span className="flex size-11 items-center justify-center bg-red transition-transform duration-300 ease-expo group-hover:translate-x-0.5">
                <Image src="/ikony/arrow-right.svg" alt="" width={20} height={20} />
            </span>
        </button>
    )
}

// Čtverec se šipkou na kartách (36 px, inkoust)
export function Sipka({ className = "" }: { className?: string }) {
    return (
        <span aria-hidden className={`flex size-9 shrink-0 items-center justify-center bg-ink font-mono text-sm text-on-ink transition-transform duration-300 ease-expo group-hover:translate-x-0.5 ${className}`}>
            →
        </span>
    )
}

// Hranatý štítek / popisek sekce: [ Nabídka vozů ]
export function Stitek({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <p className={`font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2 md:text-[13px] ${className}`}>{children}</p>
}

// Zavírací tlačítko 44×44 v pravém horním rohu panelů
export function Zavrit({ onClick, label = "Zavřít" }: { onClick: () => void; label?: string }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="absolute right-4 top-3.5 z-10 flex size-11 items-center justify-center border border-ink bg-panel font-mono text-xl text-ink hover:bg-paper-2 md:right-16 md:top-8"
        >
            ×
        </button>
    )
}
