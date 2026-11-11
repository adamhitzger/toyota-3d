import {RocketIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {TYPY_MOTORU} from './typyMotoru'

export const KATEGORIE_VOZU = [
  {title: 'Modely', value: 'modely'},
  {title: 'Skladové vozy', value: 'skladove'},
  {title: 'Předváděcí vozy', value: 'predvadeci'},
]

const czk = new Intl.NumberFormat('cs-CZ', {style: 'currency', currency: 'CZK', maximumFractionDigits: 0})

export const vuz = defineType({
  name: 'vuz',
  title: 'Vůz',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'model',
      type: 'reference',
      to: [{type: 'model'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'nazev',
      title: 'Název',
      description: 'Celý název včetně verze, např. „RAV4 Style“.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'verze',
      description: 'Jen verze výbavy, např. „Style“. Zobrazuje se v přepínači verzí.',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'nazev', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kategorie',
      type: 'string',
      options: {list: KATEGORIE_VOZU, layout: 'radio', direction: 'horizontal'},
      initialValue: 'modely',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cenaOd',
      title: 'Cena od',
      description: 'V Kč včetně DPH',
      type: 'number',
      validation: (rule) => rule.required().positive().integer(),
    }),
    defineField({
      name: 'typMotoru',
      title: 'Typ motoru',
      type: 'string',
      options: {list: TYPY_MOTORU, layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'varianty',
      title: 'Barevné varianty',
      description: 'První varianta se zobrazí jako výchozí.',
      type: 'array',
      of: [defineArrayMember({type: 'variantaVozu'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  orderings: [
    {title: 'Cena od nejnižší', name: 'cenaAsc', by: [{field: 'cenaOd', direction: 'asc'}]},
    {title: 'Název', name: 'nazevAsc', by: [{field: 'nazev', direction: 'asc'}]},
  ],
  preview: {
    select: {
      title: 'nazev',
      model: 'model.nazev',
      kategorie: 'kategorie',
      cenaOd: 'cenaOd',
      media: 'varianty.0.fotky.0',
    },
    prepare({title, model, kategorie, cenaOd, media}) {
      const kat = KATEGORIE_VOZU.find((k) => k.value === kategorie)?.title
      const cena = typeof cenaOd === 'number' ? `od ${czk.format(cenaOd)}` : undefined
      return {title, subtitle: [model, kat, cena].filter(Boolean).join(' · '), media}
    },
  },
})
