"use client"

import { sendGTMEvent } from "@next/third-parties/google"
import { useEffect } from "react"
import toast from "react-hot-toast"

import type { ActionResponse } from "@/types"

// Každé odeslání vrací nový objekt stavu → efekt se spustí po každé odpovědi akce
export function useActionToast<T>(state: ActionResponse<T>, gtmEvent?: string, formName?: string) {
    useEffect(() => {
        if (!state.submitted) return
        if (state.success) {
            toast.success(state.message)
            // GTM až po úspěchu ze serveru; v GTM trigger „Vlastní událost“ = gtmEvent → GA4, Ads, Meta Lead.
            // Do dataLayer nikdy osobní údaje.
            if (gtmEvent) sendGTMEvent({ event: gtmEvent, form_name: formName })
        } else {
            toast.error(state.message)
        }
    }, [state, gtmEvent, formName])
}

export const initialActionState = { submitted: false, success: false, message: "" }
