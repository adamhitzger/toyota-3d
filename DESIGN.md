# Design

Zdroj pravdy: Figma „Toyota Vysočina – 3D Showroom“, stránka **„v3 – Luxury (Swiss industrial)“**
https://www.figma.com/design/vpDMGGsZprFJJrfG43pwH0
(v1 tmavá a v2 světlá AAA zůstávají ve stejném souboru jako archiv.)

## Visual Theme

Prémiový showroom ve stylu švýcarského průmyslového tisku: matný papír, uhlově černý inkoust, jediná červená. Luxus nese měřítko, ne efekty: obří široký nadpis modelu, auto přes celou šířku před typografií, přesná mřížka viditelných linek a drobná monospace metadata. Inspirace: Zeekr a BYD (měřítko, klid, velký vůz), předloha Audi RS 6 (kategorie vlevo, tmavý informační panel vpravo, pás s technikou dole).

Pravidla: ostré hrany všude (radius 0), žádné stíny UI, žádné gradienty, žádné sklo. Jediný „efekt“ je obří typografie v barvě `paper-2` za autem.

## Color

| Token | Hex | Použití |
|---|---|---|
| `paper` | `#ECECEA` | pozadí |
| `paper-2` | `#E1E1DE` | náhledy, typografické pozadí za autem |
| `panel` | `#F7F7F5` | panely, pole, navigační ostrov |
| `hair` | `#C4C4C0` | vedlejší linky |
| `ink` | `#0F0F10` | text, hlavní linky, primární tlačítka, tmavé panely |
| `ink-2` | `#48484C` | vedlejší text (AAA na `paper`) |
| `on-ink` / `on-ink-2` | `#F2F2EF` / `#B9B9B4` | text na tmavých plochách |
| `red` | `#E2001A` | strukturální akcent: značky výběru, čtverec v tlačítku, linka aktivní záložky. Jako text jen 24 px a víc. |

## Typography

- **Zalando Sans Expanded** Black/ExtraBold, VERZÁLKY: názvy modelů a nadpisy. Tracking -3 až -4 %, řádkování 86–95 %. Hero 160+ px, sekce 72–112 px.
- **Geist Mono** Medium, VERZÁLKY, tracking +6 %: metadata, navigace, popisky (12–15 px). Nikdy pro podstatný obsah.
- **Atkinson Hyperlegible Next**: veškerý čtený text, popisky polí, volby (16–20 px).
- Hranaté závorky jen u 1–2 sekčních štítků na stránku: `[ MODELOVÁ ŘADA ]`.

## Layout

- Okraj 64 px, plovoucí navigační ostrov 24 px od okrajů, 1px rámeček `ink`.
- Sekce 144 px nad sebou. Přepážky jsou 1px linky přes celou šířku (struktura), ne karty.
- Hero: výběr modelu jako záložky, obří název, auto přes spodní polovinu, pás techniky dole.

## Components

- **Tlačítko**: Inkoust / Obrys / Papír / Odkaz. Výška 56 px, popisek mono 15 px, šipka ve vlastním čtverci 44 px (u Inkoustu červený čtverec).
- **Vzorek barvy**: obdélník 96×64 + název. Vybraný: 2px rám `ink` a červená značka u názvu.
- **Dlaždice volby**: náhled 152×128, vybraná má 2px rám a červenou linku pod náhledem.
- **Pole**: popisek nad polem, 56 px, rámeček 1.5 px `ink`.
- **Oddíly konfigurátoru**: 01 Barva, 02 Kola, 03 Interiér (skutečné pořadí kroků), shrnutí v tmavém oddílu.
- Ovládání scény: čtvercová tlačítka otočení, přepínač Exteriér / Interiér.

## Motion

- Ease-out expo `cubic-bezier(0.16, 1, 0.3, 1)`, 400–700 ms.
- Načtení: obří nadpis se odkryje maskou zdola, auto vjede zprava a dosedne. Jednou, ne u každé sekce.
- Změna barvy: plynulý přechod materiálu + výměna typografického pozadí (ČERVENÁ → BÍLÁ) crossfade.
- Tlačítka: čtverec se šipkou se při hoveru posune o 2 px doprava, stisk `scale(0.98)`.
- `prefers-reduced-motion`: bez vjezdů a masek, okamžité přechody.

## Imagery

- Rendery z `public/models/*-transformed.glb`, průhledné pozadí, měkký stín. Bílá pro úvod a detail, červená v konfigurátoru.
- Chybí skutečná fotka prodejny s týmem (rámeček v sekci Prodejna).
