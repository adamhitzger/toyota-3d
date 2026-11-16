import "server-only" // build selže, kdyby to někdo importoval do klientské komponenty

import { client } from "./client"

// Zapisovací klient pro server actions — token jen na serveru, bez NEXT_PUBLIC_
export const writeClient = client.withConfig({
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
})
