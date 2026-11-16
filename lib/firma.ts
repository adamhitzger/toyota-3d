// Údaje provozovatele na stránkách Kontakt a Zpracování osobních údajů.
// TODO před spuštěním: doplnit skutečnou firmu, IČO, spisovou značku, telefony, e-maily a otevírací dobu
// (v návrhu ve Figmě jsou také jen zástupné hodnoty, viz poznámka 190:1871).
export const FIRMA = {
    znacka: "Toyota Vysočina",
    obchodniFirma: "[Obchodní firma s.r.o.]",
    ico: "[00000000]",
    rejstrik: "zapsaná v obchodním rejstříku vedeném Krajským soudem v Brně, oddíl C, vložka [00000]",
    ulice: "Rantířovská 4844/6",
    mesto: "586 01 Jihlava",
    telefonProdej: "+420 000 000 000",
    telefonServis: "+420 000 000 000",
    email: "info@toyota-vysocina.cz",
    emailGdpr: "gdpr@toyota-vysocina.cz",
    // otevírací doba: text na Kontaktu i openingHoursSpecification v JSON-LD (lib/seo.ts)
    hodiny: [
        { dny: "Po–Pá", schema: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], od: "08:00", do: "18:00" },
        { dny: "So", schema: ["Saturday"], od: "09:00", do: "12:00" },
    ],
}

const cas = (c: string) => c.replace(/^0/, "")
export const OTEVIRACI_DOBA = FIRMA.hodiny.map((h) => `${h.dny} ${cas(h.od)}–${cas(h.do)}`)

export const ADRESA = `${FIRMA.ulice}, ${FIRMA.mesto}`
const dotaz = encodeURIComponent(`${FIRMA.znacka}, ${ADRESA}`)
export const MAPA_NAVIGACE = `https://www.google.com/maps/dir/?api=1&destination=${dotaz}`
export const MAPA_EMBED = `https://www.google.com/maps?q=${dotaz}&z=15&output=embed`
