import { type SchemaTypeDefinition } from 'sanity'

import { model } from './model'
import { variantaVozu } from './variantaVozu'
import { vuz } from './vuz'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [vuz, model, variantaVozu],
}
