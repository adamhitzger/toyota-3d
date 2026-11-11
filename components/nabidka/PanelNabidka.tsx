import Image from "next/image"

import { KATEGORIE, type Kategorie } from "./texty"
import { Stitek } from "./ui"

// Panel „Nabídka vozů“ (Figma 115:280 desktop / 115:309 mobil): po zastavení průletu vyjede
// zprava (na mobilu zespodu, řídí ScrollVideo přes data-reveal-*), tři dlaždice kategorií.
export default function PanelNabidka({ onVyber }: { onVyber: (k: Kategorie) => void }) {
    return (
        <nav
            aria-label="Nabídka vozů"
            className="flex flex-col gap-3.5 border border-ink bg-panel p-4 md:h-full md:gap-6 md:p-8"
        >
            <div className="flex flex-col gap-1.5 uppercase md:gap-3">
                <Stitek>[ Toyota Vysočina ]</Stitek>
                <h2 className="font-display text-[26px] font-black leading-[0.95] tracking-[-0.03em] text-ink md:text-[40px]">Nabídka vozů</h2>
            </div>
            <ul className="flex gap-2 md:min-h-0 md:flex-1 md:flex-col md:gap-3">
                {KATEGORIE.map((k) => (
                    <li key={k.value} data-reveal-tile className="flex min-w-0 flex-1 md:min-h-0">
                        <button
                            onClick={() => onVyber(k.value)}
                            className="group flex w-full flex-col border border-ink bg-panel text-left transition-transform active:scale-[0.98]"
                        >
                            <span className="relative block h-20 w-full bg-paper-2 md:h-auto md:min-h-20 md:flex-1">
                                <Image src={k.ikona} alt="" fill sizes="(min-width: 768px) 390px, 110px" className="object-contain" />
                            </span>
                            <span className="flex w-full items-center border-t border-ink px-2 pb-2.5 pt-2 md:gap-3 md:p-0 md:pl-4">
                                <span className="flex min-w-0 flex-1 flex-col gap-1 md:uppercase">
                                    <span className="font-body text-[13px] font-bold leading-[1.15] text-ink md:font-display md:text-lg md:font-extrabold md:leading-none md:tracking-[-0.02em]">
                                        {k.nazev}
                                    </span>
                                    <span className="hidden font-mono text-xs tracking-[0.06em] text-ink-2 md:block">{k.popis}</span>
                                </span>
                                <span
                                    aria-hidden
                                    className="hidden h-16 w-14 shrink-0 items-center justify-center bg-red font-mono text-lg text-on-ink transition-[padding] duration-300 ease-expo group-hover:pl-1 md:flex"
                                >
                                    →
                                </span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
