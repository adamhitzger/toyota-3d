import type { Vuz } from "@/sanity.types"

export type Kategorie = Vuz["kategorie"]
export type TypMotoru = Vuz["typMotoru"]

// Dlaždice v panelu „Nabídka vozů“ (Figma 115:230), ikony z „Ikony nabídky“
export const KATEGORIE: { value: Kategorie; nazev: string; popis: string; ikona: string }[] = [
    { value: "modely", nazev: "Modely", popis: "Celá modelová řada", ikona: "/ikony/nabidka-modely.png" },
    { value: "skladove", nazev: "Skladové vozy", popis: "Ihned k odběru", ikona: "/ikony/nabidka-skladove.png" },
    { value: "predvadeci", nazev: "Předváděcí vozy", popis: "Zvýhodněné, s nájezdem", ikona: "/ikony/nabidka-predvadeci.png" },
]
export const nazevKategorie = (k: Kategorie) => KATEGORIE.find((x) => x.value === k)!.nazev

// Filtr pohonu v mřížce modelů (přídavná jména) a krátké názvy na kartách a štítcích
export const POHONY: { value: TypMotoru; filtr: string; kratce: string }[] = [
    { value: "hybrid", filtr: "Hybridní", kratce: "hybrid" },
    { value: "plugin-hybrid", filtr: "Plug-in hybridní", kratce: "plug-in hybrid" },
    { value: "mild-hybrid", filtr: "Mild hybridní", kratce: "mild hybrid" },
    { value: "elektricky", filtr: "Elektrický", kratce: "elektro" },
    { value: "spalovaci", filtr: "Spalovací", kratce: "spalovací" },
    { value: "vodikovy", filtr: "Vodíkový", kratce: "vodík" },
]

const velke = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
export const pohon = (t: TypMotoru) => velke(POHONY.find((p) => p.value === t)!.kratce)

// „Hybrid a plug-in hybrid“, „Mild hybrid, elektro a spalovací“
export function pohony(typy: TypMotoru[]) {
    const n = POHONY.filter((p) => typy.includes(p.value)).map((p) => p.kratce)
    if (n.length === 0) return ""
    const text = n.length === 1 ? n[0] : `${n.slice(0, -1).join(", ")} a ${n[n.length - 1]}`
    return velke(text)
}

const plural = (n: number, jeden: string, dva: string, pet: string) =>
    `${n} ${n === 1 ? jeden : n >= 2 && n <= 4 ? dva : pet}`
export const ceniky = (n: number) => plural(n, "ceník", "ceníky", "ceníků")
export const verze = (n: number) => plural(n, "verze", "verze", "verzí")

const czk = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 })
export const cena = (n: number) => czk.format(n)

export const PRODEJNA = "Toyota Vysočina, Rantířovská 4844/6, Jihlava"
