import { z } from "zod"

export const TEMATA = [
    { value: "novy-vuz", nazev: "Nákup nového vozu" },
    { value: "ojety-vuz", nazev: "Skladový nebo předváděcí vůz" },
    { value: "testovaci-jizda", nazev: "Testovací jízda" },
    { value: "servis", nazev: "Servis a údržba" },
    { value: "jine", nazev: "Něco jiného" },
] as const

const telefon = z
    .string()
    .trim()
    .regex(/^(\+?[0-9 ]{9,16})?$/, "Zadejte telefon ve tvaru +420 777 123 456")

// Formulář na stránce Kontakt (Figma 189:1230). Stačí telefon, nebo e-mail.
const zaklad = z.object({
    tema: z.enum(TEMATA.map((t) => t.value) as [string, ...string[]], "Vyberte téma"),
    jmeno: z.string().trim().min(2, "Zadejte jméno a příjmení").max(120),
    telefon,
    email: z.union([z.literal(""), z.email("Neplatný e-mail")]),
    zprava: z.string().trim().min(10, "Zpráva musí mít aspoň 10 znaků").max(2000, "Zpráva může mít nejvýš 2000 znaků"),
    souhlas: z.literal("on", "Potvrďte souhlas se zpracováním osobních údajů"),
})

// when: kontrola „telefon nebo e-mail“ proběhne i tehdy, když jiná pole ještě neprošla
export const kontaktSchema = zaklad.refine((d) => d.telefon || d.email, {
    path: ["email"],
    message: "Vyplňte telefon nebo e-mail",
    when: (p) => zaklad.pick({ telefon: true, email: true }).safeParse(p.value).success,
})

export type KontaktInputs = z.infer<typeof kontaktSchema>
