import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // false: data cachuje Next (cacheTag) a po webhooku musí přijít čerstvá, ne starší kopie z API CDN
  useCdn: false,
})
