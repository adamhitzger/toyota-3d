import { type SchemaTypeDefinition } from 'sanity'

import { dotaz } from './dotaz'
import { model } from './model'
import { poptavka } from './poptavka'
import { variantaVozu } from './variantaVozu'
import { vuz } from './vuz'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [vuz, model, variantaVozu, poptavka, dotaz],
}
