import {ColorWheelIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const variantaVozu = defineType({
  name: 'variantaVozu',
  title: 'Barevná varianta',
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
      name: 'fotky',
      description: 'První fotka je hlavní, další se načtou až při posunu galerie.',
      type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'nazevBarvy', hex: 'barva.hex', media: 'fotky.0'},
    prepare: ({title, hex, media}) => ({title, subtitle: hex, media}),
  },
})
