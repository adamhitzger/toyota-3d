import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const TEMATA = [
  {title: 'Nákup nového vozu', value: 'novy-vuz'},
  {title: 'Skladový nebo předváděcí vůz', value: 'ojety-vuz'},
  {title: 'Testovací jízda', value: 'testovaci-jizda'},
  {title: 'Servis a údržba', value: 'servis'},
  {title: 'Něco jiného', value: 'jine'},
]

// Dotaz z formuláře na stránce /kontakt — zakládá ho server action, v Studiu jen ke čtení
export const dotaz = defineType({
  name: 'dotaz',
  title: 'Dotaz z kontaktu',
  type: 'document',
  icon: EnvelopeIcon,
  readOnly: true,
  fields: [
    defineField({name: 'tema', title: 'Téma', type: 'string', options: {list: TEMATA}}),
    defineField({name: 'jmeno', title: 'Jméno a příjmení', type: 'string'}),
    defineField({name: 'telefon', type: 'string'}),
    defineField({name: 'email', title: 'E-mail', type: 'string'}),
    defineField({name: 'zprava', title: 'Zpráva', type: 'text'}),
    defineField({name: 'souhlas', title: 'Souhlas se zpracováním os. údajů', type: 'boolean'}),
    defineField({name: 'vytvoreno', title: 'Odesláno', type: 'datetime'}),
  ],
  orderings: [{title: 'Nejnovější', name: 'vytvoreno', by: [{field: 'vytvoreno', direction: 'desc'}]}],
  preview: {
    select: {title: 'jmeno', tema: 'tema', vytvoreno: 'vytvoreno'},
    prepare: ({title, tema, vytvoreno}) => ({
      title,
      subtitle: [TEMATA.find((t) => t.value === tema)?.title, vytvoreno && new Date(vytvoreno).toLocaleString('cs-CZ')]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
