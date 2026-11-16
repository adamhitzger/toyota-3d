"use server"

import { z } from "zod"

import { nactiPole } from "@/lib/formdata"
import { kontaktSchema, type KontaktInputs } from "@/lib/schemas/kontakt"
import { writeClient } from "@/sanity/lib/write-client"
import type { ActionResponse } from "@/types"

type Res = ActionResponse<KontaktInputs>

const POLE = ["tema", "jmeno", "telefon", "email", "zprava", "souhlas"] as const

export async function odeslatKontakt(_prev: Res, formData: FormData): Promise<Res> {
    // 1) Příjem dat
    const raw = nactiPole(formData, POLE)

    // honeypot vyplněný → bot, falešný úspěch
    if (formData.get("web_firmy")) {
        return { submitted: true, success: true, message: "Děkujeme, ozveme se." }
    }

    // 2) Validace — vždy na serveru
    const parsed = kontaktSchema.safeParse(raw)
    if (!parsed.success) {
        return {
            submitted: true,
            success: false,
            message: "Zkontrolujte zvýrazněná pole.",
            inputs: raw,
            errors: z.flattenError(parsed.error).fieldErrors,
        }
    }

    // 3) Mutace — zápis do Sanity (dokument „dotaz“)
    try {
        await writeClient.create({
            _type: "dotaz",
            ...parsed.data,
            souhlas: true, // schéma pustí jen zaškrtnutý souhlas ("on") → v Sanity boolean
            vytvoreno: new Date().toISOString(),
        })
    } catch (err) {
        console.error("[odeslatKontakt]", err)
        return { submitted: true, success: false, message: "Odeslání se nepovedlo, zkuste to znovu.", inputs: raw }
    }

    // 4) Return
    return { submitted: true, success: true, message: "Děkujeme, ozveme se do jednoho pracovního dne." }
}
