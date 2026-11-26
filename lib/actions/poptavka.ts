"use server"

import { z } from "zod"

import { POHONY } from "@/components/nabidka/texty"
import { nactiPole } from "@/lib/formdata"
import { poptavkaSchema, type PoptavkaInputs } from "@/lib/schemas/poptavka"
import { client } from "@/sanity/lib/client"
import { writeClient } from "@/sanity/lib/write-client"
import type { ActionResponse } from "@/types"

type Res = ActionResponse<PoptavkaInputs>

const POLE = ["vuz", "barva", "pohon", "jmeno", "telefon", "email", "kontakt", "poznamka", "souhlas"] as const

export async function odeslatPoptavku(_prev: Res, formData: FormData): Promise<Res> {
    const raw = nactiPole(formData, POLE)

    if (formData.get("web_firmy")) {
        return { submitted: true, success: true, message: "Děkujeme, prodejce se vám ozve." }
    }

    const parsed = poptavkaSchema.safeParse(raw)
    if (!parsed.success) {
        return {
            submitted: true,
            success: false,
            message: "Zkontrolujte zvýrazněná pole.",
            inputs: raw,
            errors: z.flattenError(parsed.error).fieldErrors,
        }
    }

    const { vuz: slug, barva: barvaKey, pohon: typPohonu, ...data } = parsed.data
    try {
        // vůz, barvu a pohon dohledat na serveru podle slugu — klientovi nevěříme ID ani názvy
        const vuz = await client.fetch<{ _id: string; nazev: string; barva: string | null; pohony: string[] } | null>(
            `*[_type == "vuz" && slug.current == $slug][0]{ _id, nazev, "barva": varianty[_key == $barva][0].nazevBarvy, "pohony": [typMotoru, ...coalesce(varianty[].pohony[].typMotoru, [])] }`,
            { slug, barva: barvaKey },
        )
        if (!vuz) {
            return { submitted: true, success: false, message: "Vybraný vůz už v nabídce není.", inputs: raw }
        }
        await writeClient.create({
            _type: "poptavka",
            vuz: { _type: "reference", _ref: vuz._id, _weak: true },
            nazevVozu: vuz.nazev,
            barva: vuz.barva ?? undefined,
            pohon: POHONY.find((p) => p.value === typPohonu && vuz.pohony.includes(p.value))?.filtr,
            ...data,
            souhlas: true, // schéma pustí jen zaškrtnutý souhlas ("on") → v Sanity boolean
            vytvoreno: new Date().toISOString(),
        })
    } catch (err) {
        console.error("[odeslatPoptavku]", err)
        return { submitted: true, success: false, message: "Odeslání se nepovedlo, zkuste to znovu.", inputs: raw }
    }

    return { submitted: true, success: true, message: "Poptávka odeslána, prodejce se vám ozve." }
}
