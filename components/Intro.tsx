import { MapPin } from "lucide-react"

// Úvod přes první záběr průletu (pohled shora). Zmizí se začátkem scrollu (data-intro, ScrollVideo).
export default function Intro() {
    return (
        <div data-intro className="pointer-events-none absolute inset-0 bg-[#0F0F10]/40">
            <div className="absolute inset-x-6 bottom-[22vh] text-[#F2F2EF] md:inset-x-16 md:bottom-auto md:top-[24vh]">
                <h1 className="font-display text-[clamp(2.75rem,10vw,10rem)] font-black uppercase leading-[0.95] tracking-[-0.035em]">
                    Toyota
                    <br />
                    Vysočina
                </h1>
                <p className="mt-6 max-w-[34ch] font-body text-lg leading-snug md:mt-8 md:text-xl">
                    Vítejte v Toyota Showroomu. Co vás k nám přivádí?
                </p>
                <p className="mt-5 flex items-center gap-2 font-body text-base text-[#B9B9B4] md:text-lg">
                    <MapPin aria-hidden className="size-5 shrink-0 text-[#E2001A]" strokeWidth={2} />
                    Rantířovská 4844/6, Jihlava
                </p>
            </div>
        </div>
    )
}
