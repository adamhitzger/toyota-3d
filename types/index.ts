// Odpověď server action pro useActionState (manuál 2.2, krok 2)
export type ActionResponse<T> = {
    submitted: boolean // false jen v initial state → hook nezobrazí toast při mountu
    success: boolean
    message: string // text do toastu
    inputs?: Partial<Record<keyof T, string>> // vyplněné hodnoty zpět do formuláře
    errors?: Partial<Record<keyof T, string[]>> // chyby po polích ze zod
}
