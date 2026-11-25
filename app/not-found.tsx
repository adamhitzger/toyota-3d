import type { Metadata } from "next"
import Link from "next/link"

import { Nadpis, Ramec } from "@/components/web/Ramec"

export const metadata: Metadata = { title: "Stránka nenalezena" }

export default function NotFound() {
    return (
        <Ramec>
            <div className="flex flex-col items-start gap-6 px-4 py-12 md:px-16 md:py-24">
                <Nadpis stitek="404" className="text-[34px] md:text-[64px]">
                    Stránka nenalezena
                </Nadpis>
                <Link href="/modely" className="flex h-14 items-center bg-ink px-6 font-mono text-[15px] uppercase tracking-[0.08em] text-on-ink">
                    Modely a ceny →
                </Link>
            </div>
        </Ramec>
    )
}
