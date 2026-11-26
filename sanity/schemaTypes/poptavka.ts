import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Poptávka vozu z panelu nabídky — zakládá ji server action, v Studiu jen ke čtení
export const poptavka = defineType({
  name: 'poptavka',
  title: 'Poptávka vozu',
  type: 'document',
  icon: DocumentTextIcon,
  readOnly: true,
  fields: [
    defineField({name: 'vuz', title: 'Vůz', type: 'reference', to: [{type: 'vuz'}], weak: true}),
    defineField({name: 'nazevVozu', title: 'Název vozu v době poptávky', type: 'string'}),
    defineField({name: 'barva', type: 'string'}),
    defineField({name: 'pohon', type: 'string'}),
    defineField({name: 'jmeno', title: 'Jméno a příjmení', type: 'string'}),
    defineField({name: 'telefon', type: 'string'}),
    defineField({name: 'email', title: 'E-mail', type: 'string'}),
    defineField({
      name: 'kontakt',
      title: 'Preferovaný kontakt',
      type: 'string',
      options: {list: [{title: 'Zavolat', value: 'telefon'}, {title: 'Napsat e-mail', value: 'email'}]},
    }),
    defineField({name: 'poznamka', title: 'Poznámka', type: 'text'}),
    defineField({name: 'souhlas', title: 'Souhlas se zpracováním os. údajů', type: 'boolean'}),
    defineField({name: 'vytvoreno', title: 'Odesláno', type: 'datetime'}),
  ],
  orderings: [{title: 'Nejnovější', name: 'vytvoreno', by: [{field: 'vytvoreno', direction: 'desc'}]}],
  preview: {
    select: {title: 'jmeno', vuz: 'nazevVozu', vytvoreno: 'vytvoreno'},
    prepare: ({title, vuz, vytvoreno}) => ({
      title,
      subtitle: [vuz, vytvoreno && new Date(vytvoreno).toLocaleString('cs-CZ')].filter(Boolean).join(' · '),
    }),
  },
})
