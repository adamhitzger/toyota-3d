// Údaje provozovatele na stránkách Kontakt a Zpracování osobních údajů.
// Ověřeno 25. 11. 2026: kontakty a hodiny toyota-jihlava.cz/kontakt, IČO a spisová značka ARES,
// poloha z adresáře poboček toyotavysocina.cz. emailGdpr je obecný e-mail, zvláštní adresa není známá.
export const FIRMA = {
    znacka: "Toyota Vysočina.cz",
    obchodniFirma: "T Vysočina s.r.o.",
    ico: "05369444",
    dic: "CZ05369444",
    rejstrik: "zapsaná v obchodním rejstříku vedeném Krajským soudem v Brně, oddíl C, vložka 99760",
    ulice: "Rantířovská 4844/6",
    mesto: "586 01 Jihlava",
    telefonProdej: "+420 565 552 301",
    telefonServis: "+420 565 552 302",
    email: "info@toyotavysocina.cz",
    emailGdpr: "info@toyotavysocina.cz",
    geo: { latitude: 49.396283, longitude: 15.564756 },
    // ostatní profily téže pobočky, schema.org sameAs (Firmy.cz na ně odkazuje)
    profily: [
        "https://www.toyota-jihlava.cz/",
        "https://www.firmy.cz/detail/13053068-t-vysocina-s-r-o-jihlava.html",
        "https://www.facebook.com/toyotavysocinacz",
        "https://www.instagram.com/toyotavysocina",
        "https://www.linkedin.com/company/toyota-vysocina",
        "https://www.youtube.com/@ToyotaVysocina",
    ],
    // otevírací doba prodeje: text na Kontaktu i openingHoursSpecification v JSON-LD (lib/seo.ts)
    hodiny: [
        { dny: "Po–Pá", schema: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], od: "08:00", do: "17:00" },
        { dny: "So", schema: ["Saturday"], od: "09:00", do: "12:00" },
    ],
}

const cas = (c: string) => c.replace(/^0/, "")
export const OTEVIRACI_DOBA = FIRMA.hodiny.map((h) => `${h.dny} ${cas(h.od)}–${cas(h.do)}`)

export const ADRESA = `${FIRMA.ulice}, ${FIRMA.mesto}`
// mapy hledají podle značky bez domény
const dotaz = encodeURIComponent(`Toyota, ${ADRESA}`)
export const MAPA_NAVIGACE = `https://www.google.com/maps/dir/?api=1&destination=${dotaz}`
export const MAPA_EMBED = `https://www.google.com/maps?q=${dotaz}&z=15&output=embed`
