// schema.org graf do <script type="application/ld+json">; „<“ se escapuje, aby text z dat nemohl ukončit script
export default function JsonLd({ uzly }: { uzly: Record<string, unknown>[] }) {
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": uzly }).replace(/</g, "\\u003c")
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
