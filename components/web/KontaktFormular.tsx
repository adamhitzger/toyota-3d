"use client"

import { useActionState } from "react"
import Link from "next/link"

import { Tlacitko } from "@/components/nabidka/ui"
import { initialActionState, useActionToast } from "@/hooks/use-action-toast"
import { odeslatKontakt } from "@/lib/actions/kontakt"
import { TEMATA, type KontaktInputs } from "@/lib/schemas/kontakt"
import type { ActionResponse } from "@/types"

import { Chyba, Past, Vyber, pole, popisek } from "./pole"

// Formulář „Napište nám“ (Figma 189:1230) → server action odeslatKontakt
export default function KontaktFormular() {
    const [state, formAction, isPending] = useActionState<ActionResponse<KontaktInputs>, FormData>(odeslatKontakt, initialActionState)
    useActionToast(state, "generate_lead", "kontakt")
    const v = state.inputs
    const e = state.errors

    // aria vlastnosti pole s chybou
    const a = (k: keyof KontaktInputs & string) => ({
        "aria-invalid": e?.[k] ? true : undefined,
        "aria-describedby": e?.[k] ? `${k}-chyba` : undefined,
    })

    return (
        // React 19 po akci formulář resetuje na defaultValue → po chybě se vrátí hodnoty ze state.inputs,
        // po úspěchu (bez inputs) zůstane prázdný
        <form action={formAction} noValidate className="relative flex flex-col gap-3.5 md:gap-[18px]">
            <Past />
            <h2 className="font-display text-[22px] font-extrabold uppercase tracking-[-0.02em] md:text-[26px]">Napište nám</h2>

            <label className="flex flex-col gap-2">
                <span className={popisek}>S čím vám můžeme pomoci?</span>
                <Vyber name="tema" defaultValue={v?.tema ?? TEMATA[0].value} {...a("tema")}>
                    {TEMATA.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.nazev}
                        </option>
                    ))}
                </Vyber>
                <Chyba id="tema-chyba" chyby={e?.tema} />
            </label>

            <label className="flex flex-col gap-2">
                <span className={popisek}>Jméno a příjmení</span>
                <input name="jmeno" autoComplete="name" required placeholder="Např. Petra Dvořáková" defaultValue={v?.jmeno} className={`${pole} h-14`} {...a("jmeno")} />
                <Chyba id="jmeno-chyba" chyby={e?.jmeno} />
            </label>

            <div className="flex flex-col gap-3.5 md:flex-row md:gap-4">
                <label className="flex flex-1 flex-col gap-2">
                    <span className={popisek}>Telefon</span>
                    <input name="telefon" type="tel" autoComplete="tel" placeholder="+420" defaultValue={v?.telefon} className={`${pole} h-14`} {...a("telefon")} />
                    <Chyba id="telefon-chyba" chyby={e?.telefon} />
                </label>
                <label className="flex flex-1 flex-col gap-2">
                    <span className={popisek}>E-mail</span>
                    <input name="email" type="email" autoComplete="email" placeholder="Např. petra@email.cz" defaultValue={v?.email} className={`${pole} h-14`} {...a("email")} />
                    <Chyba id="email-chyba" chyby={e?.email} />
                </label>
            </div>

            <label className="flex flex-col gap-2">
                <span className={popisek}>Zpráva</span>
                <textarea name="zprava" rows={5} required placeholder="Napište, s čím potřebujete poradit…" defaultValue={v?.zprava} className={`${pole} min-h-[150px] py-3.5 leading-[1.4]`} {...a("zprava")} />
                <Chyba id="zprava-chyba" chyby={e?.zprava} />
            </label>

            <div className="flex flex-col gap-2">
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        name="souhlas"
                        required
                        defaultChecked={v?.souhlas === "on"}
                        className="mt-0.5 size-[22px] shrink-0 appearance-none border-[1.5px] border-ink bg-panel checked:bg-ink checked:shadow-[inset_0_0_0_4px_var(--color-panel)] aria-invalid:border-red"
                        {...a("souhlas")}
                    />
                    <span className="font-body text-sm leading-[1.4] md:text-[15px]">
                        Odesláním souhlasím se{" "}
                        <Link href="/zpracovani-osobnich-udaju" className="font-bold underline">
                            zpracováním osobních údajů
                        </Link>{" "}
                        za účelem vyřízení dotazu.
                    </span>
                </label>
                <Chyba id="souhlas-chyba" chyby={e?.souhlas} />
            </div>

            <Tlacitko type="submit" disabled={isPending}>
                {isPending ? "Odesílám…" : "Odeslat zprávu"}
            </Tlacitko>
        </form>
    )
}
