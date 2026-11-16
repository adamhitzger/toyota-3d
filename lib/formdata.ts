// FormData → prostý objekt textových hodnot podle seznamu polí (nepřítomné pole = "")
export function nactiPole<K extends string>(formData: FormData, pole: readonly K[]) {
    return Object.fromEntries(pole.map((k) => [k, String(formData.get(k) ?? "")])) as Record<K, string>
}
