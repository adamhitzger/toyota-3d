import { z } from "zod"

// Poptávka vozu z panelu nabídky (Figma 128:693). Povinný je kontakt, kterým se má prodejce ozvat.
const zaklad = z.object({
    vuz: z.string().trim().min(1, "Vyberte vůz"),
    barva: z.string().trim().max(80),
    jmeno: z.string().trim().min(2, "Zadejte jméno a příjmení").max(120),
    telefon: z
        .string()
        .trim()
        .regex(/^(\+?[0-9 ]{9,16})?$/, "Zadejte telefon ve tvaru +420 777 123 456"),
    email: z.union([z.literal(""), z.email("Neplatný e-mail")]),
    kontakt: z.enum(["telefon", "email"]),
    poznamka: z.string().trim().max(1000, "Poznámka může mít nejvýš 1000 znaků"),
    souhlas: z.literal("on", "Potvrďte souhlas se zpracováním osobních údajů"),
})

// when: kontrola zvoleného kontaktu proběhne i tehdy, když jiná pole ještě neprošla
const kontaktOk = (p: { value: unknown }) => zaklad.pick({ kontakt: true, telefon: true, email: true }).safeParse(p.value).success

export const poptavkaSchema = zaklad
    .refine((d) => d.kontakt !== "telefon" || d.telefon, { path: ["telefon"], message: "Zadejte telefon, ať vám můžeme zavolat", when: kontaktOk })
    .refine((d) => d.kontakt !== "email" || d.email, { path: ["email"], message: "Zadejte e-mail, ať vám můžeme napsat", when: kontaktOk })

export type PoptavkaInputs = z.infer<typeof poptavkaSchema>
