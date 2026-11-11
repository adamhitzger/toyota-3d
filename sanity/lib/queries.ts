import { defineQuery } from 'next-sanity'

// Fotka včetně hotspotu/cropu pro urlFor() a LQIP placeholderu
const fotkaFragment = /* groq */ `
  _key,
  asset->{ _id, url, metadata { lqip, dimensions { width, height } } },
  hotspot,
  crop
`

// Karta vozu v seznamu: hlavní fotka první varianty + barvy na výběr
const vuzKartaFragment = /* groq */ `
  _id,
  nazev,
  verze,
  "slug": slug.current,
  "model": model->{ _id, nazev, "slug": slug.current, typyMotoru },
  kategorie,
  cenaOd,
  typMotoru,
  "foto": varianty[0].fotky[0]{ ${fotkaFragment} },
  "barvy": varianty[]{ _key, nazevBarvy, "hex": barva.hex }
`

/** Seznam všech vozů, nejlevnější první. */
export const VOZY_QUERY = defineQuery(/* groq */ `
  *[_type == "vuz" && defined(slug.current)]
    | order(cenaOd asc, nazev asc) { ${vuzKartaFragment} }
`)

/** Seznam vozů podle typu pohonu. Param: $typMotoru ("hybrid" | "plugin-hybrid" | …). */
export const VOZY_PODLE_POHONU_QUERY = defineQuery(/* groq */ `
  *[_type == "vuz" && defined(slug.current) && typMotoru == $typMotoru]
    | order(cenaOd asc, nazev asc) { ${vuzKartaFragment} }
`)

/**
 * Vozy jednoho modelu v kategorii (RAV4 Comfort, Style, Executive…).
 * Params: $modelId, $kategorie.
 */
export const VOZY_MODELU_QUERY = defineQuery(/* groq */ `
  *[_type == "vuz" && defined(slug.current) && model._ref == $modelId && kategorie == $kategorie]
    | order(cenaOd asc, nazev asc) { ${vuzKartaFragment} }
`)

/**
 * Modely v kategorii (Modely / Skladové / Předváděcí) pro mřížku v nabídce: počet vozů,
 * nejnižší cena, pohony modelu (filtr) a fotka nejlevnějšího vozu. Modely bez vozů
 * v kategorii vypadnou.
 * Param: $kategorie ("modely" | "skladove" | "predvadeci").
 */
export const MODELY_QUERY = defineQuery(/* groq */ `
  *[_type == "model" && defined(slug.current)]{
    _id,
    nazev,
    "slug": slug.current,
    typyMotoru,
    "vozy": *[_type == "vuz" && model._ref == ^._id && kategorie == $kategorie]
      | order(cenaOd asc){ cenaOd, "foto": varianty[0].fotky[0]{ ${fotkaFragment} } }
  }[count(vozy) > 0]{
    _id,
    nazev,
    slug,
    "pocetVozu": count(vozy),
    "cenaOd": vozy[0].cenaOd,
    typyMotoru,
    "foto": vozy[0].foto
  } | order(nazev asc)
`)

/**
 * Detail vozu: u každé barevné varianty jen hlavní fotka a počet fotek.
 * Zbytek galerie se dotahuje při posunu přes VARIANTA_FOTKY_QUERY.
 * `verzeModelu` = ostatní vozy stejného modelu a kategorie pro přepínač verzí.
 * Param: $slug.
 */
export const VUZ_QUERY = defineQuery(/* groq */ `
  *[_type == "vuz" && slug.current == $slug][0]{
    _id,
    nazev,
    verze,
    "slug": slug.current,
    "model": model->{ _id, nazev, "slug": slug.current, typyMotoru },
    kategorie,
    cenaOd,
    typMotoru,
    varianty[]{
      _key,
      nazevBarvy,
      "hex": barva.hex,
      "foto": fotky[0]{ ${fotkaFragment} },
      "pocetFotek": count(fotky)
    },
    "verzeModelu": *[_type == "vuz" && model._ref == ^.model._ref && kategorie == ^.kategorie && defined(slug.current)]
      | order(cenaOd asc){ _id, nazev, verze, "slug": slug.current, cenaOd }
  }
`)

/**
 * Zbývající fotky jedné varianty (bez první, ta už je z VUZ_QUERY).
 * Params: $slug (vozu), $variantaKey (_key varianty).
 */
export const VARIANTA_FOTKY_QUERY = defineQuery(/* groq */ `
  *[_type == "vuz" && slug.current == $slug][0]
    .varianty[_key == $variantaKey][0]
    .fotky[1..-1]{ ${fotkaFragment} }
`)
