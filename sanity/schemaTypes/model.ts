import {StackIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {TYPY_MOTORU} from './typyMotoru'

// Modelová řada (RAV4, Aygo X…). Jednotlivé vozy na ni odkazují přes Vůz → Model.
export const model = defineType({
  name: 'model',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'nazev',
      title: 'Název',
      description: 'Např. „Nová RAV4“.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'nazev', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'typyMotoru',
      title: 'Typy motoru',
      description: 'Všechny pohony, ve kterých se model nabízí. Podle nich filtruje nabídka.',
      type: 'array',
      of: [{type: 'string'}],
      options: {list: TYPY_MOTORU, layout: 'grid'},
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: {title: 'nazev', subtitle: 'slug.current'},
  },
})
