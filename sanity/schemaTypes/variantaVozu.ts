import {ColorWheelIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {TYPY_MOTORU} from './typyMotoru'

export const variantaVozu = defineType({
  name: 'variantaVozu',
  title: 'Varianta (barva a pohony)',
  type: 'object',
  icon: ColorWheelIcon,
  fields: [
    defineField({
      name: 'nazevBarvy',
      title: 'Název barvy',
      description: 'Např. „Emotional Red“ – zobrazuje se u výběru barvy a v poptávce.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'barva',
      type: 'color',
      options: {disableAlpha: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pohony',
      title: 'Pohony',
      description:
        'Pohony, se kterými se tato barva nabízí. Prázdné = typ motoru a cena vozu. Když jich má vůz víc, návštěvník si vybírá u auta i v poptávce.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'pohonVarianty',
          title: 'Pohon',
          type: 'object',
          fields: [
            defineField({
              name: 'typMotoru',
              title: 'Typ motoru',
              type: 'string',
              options: {list: TYPY_MOTORU, layout: 'dropdown'},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'cenaOd',
              title: 'Cena od',
              description: 'V Kč včetně DPH. Prázdné = cena vozu.',
              type: 'number',
              validation: (rule) => rule.positive().integer(),
            }),
          ],
          preview: {
            select: {typMotoru: 'typMotoru', cenaOd: 'cenaOd'},
            prepare: ({typMotoru, cenaOd}) => ({
              title: TYPY_MOTORU.find((t) => t.value === typMotoru)?.title ?? 'Vyberte pohon',
              subtitle: cenaOd ? `od ${cenaOd.toLocaleString('cs-CZ')} Kč` : 'cena vozu',
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((pohony) => {
          const typy = ((pohony ?? []) as {typMotoru?: string}[]).map((p) => p.typMotoru)
          return new Set(typy).size === typy.length || 'Každý pohon zadejte jen jednou'
        }),
    }),
    defineField({
      name: 'fotky',
      description: 'První fotka je hlavní, další se načtou až při posunu galerie.',
      type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'nazevBarvy', hex: 'barva.hex', pohony: 'pohony', media: 'fotky.0'},
    prepare: ({title, hex, pohony, media}) => ({
      title,
      subtitle: [
        hex,
        ...((pohony ?? []) as {typMotoru?: string}[]).map((p) => TYPY_MOTORU.find((t) => t.value === p.typMotoru)?.title),
      ]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
