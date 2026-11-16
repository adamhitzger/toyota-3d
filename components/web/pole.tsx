import Image from "next/image"
import { ReactNode, SelectHTMLAttributes } from "react"

// Styly polí stejné jako v Poptávce (Figma 128:685)
export const popisek = "font-body text-[17px] font-bold leading-[1.3] text-ink"
export const pole =
    "w-full border-[1.5px] border-ink bg-panel px-4 font-body text-lg text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-ink aria-invalid:border-red"

export function Chyba({ id, chyby }: { id: string; chyby?: string[] }) {
    if (!chyby?.length) return null
    return (
        <p id={id} className="font-body text-[15px] font-bold text-red">
            {chyby[0]}
        </p>
    )
}

export function Vyber({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
    return (
        <span className="relative flex">
            <select {...props} className={`${pole} h-14 appearance-none pr-11 font-bold`}>
                {children}
            </select>
            <Image src="/ikony/chevron-down.svg" alt="" width={20} height={20} className="pointer-events-none absolute right-4 top-[18px]" />
        </span>
    )
}

// Honeypot: člověk ho nevidí, bot ho vyplní → akce odpověď zahodí
export function Past() {
    return (
        <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
                Web firmy
                <input type="text" name="web_firmy" tabIndex={-1} autoComplete="off" />
            </label>
        </div>
    )
}
