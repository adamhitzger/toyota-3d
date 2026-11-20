import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Geist, Geist_Mono, Zalando_Sans_Expanded } from "next/font/google";
import { Toaster } from "react-hot-toast";
import JsonLd from "@/components/web/JsonLd";
import { FIRMA } from "@/lib/firma";
import { firmaLd, NAZEV_WEBU, OG_OBRAZEK, OG_WEBU, POPIS_WEBU, SITE_URL, TITULEK_WEBU, webLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// DESIGN.md: Zalando Sans Expanded na nadpisy, Atkinson Hyperlegible Next na čtený text
// next/font nemá pro Zalando Sans Expanded ani Atkinson Hyperlegible Next metriky, ze kterých
// počítá upravený fallback (varování „Failed to find font override values“) → fallback ručně
const display = Zalando_Sans_Expanded({
  variable: "--font-zalando-expanded",
  subsets: ["latin", "latin-ext"],
  weight: ["800", "900"],
  adjustFontFallback: false,
  fallback: ["Arial Black", "Arial", "sans-serif"],
});

const body = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  adjustFontFallback: false,
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITULEK_WEBU,
    template: `%s · ${FIRMA.znacka}`,
  },
  description: POPIS_WEBU,
  applicationName: NAZEV_WEBU,
  keywords: [
    "Toyota",
    "Toyota Jihlava",
    "Toyota Vysočina",
    "Toyota Vysočina.cz",
    "autosalon Jihlava",
    "nové vozy Toyota",
    "skladové vozy",
    "předváděcí vozy",
    "servis Toyota",
    "3D showroom",
  ],
  authors: [{ name: FIRMA.znacka, url: SITE_URL }],
  creator: FIRMA.znacka,
  publisher: FIRMA.znacka,
  generator: "Next.js",
  category: "automotive",
  referrer: "strict-origin-when-cross-origin",
  // čísla a adresy si odkazy dělá web sám (tel:, mailto:), iOS je nemá přebarvovat
  formatDetection: { telephone: false, email: false, address: false },
  // ikony z public/ (ne file convention v app/: ta u catch-all /studio blokuje prerender metadat)
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { title: FIRMA.znacka, statusBarStyle: "black-translucent" },
  // canonical a og:url jen na stránkách: zděděné z layoutu by tvrdily „/“ i jinde a u catch-all
  // /studio relativní URL blokuje prerender metadat (počítá se z adresy stránky)
  openGraph: OG_WEBU,
  twitter: {
    card: "summary_large_image",
    title: TITULEK_WEBU,
    description: POPIS_WEBU,
    images: [OG_OBRAZEK.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F10",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* firma a web jsou na každé stránce, stránky se na ně odkazují přes @id (lib/seo.ts) */}
        <JsonLd uzly={[firmaLd, webLd]} />
        {children}
        {/* toasty z useActionToast (formuláře Kontakt a Poptávka), hranaté podle DESIGN.md */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!rounded-none !border-[1.5px] !border-ink !bg-panel !font-body !text-[15px] !text-ink !shadow-none",
            success: { iconTheme: { primary: "#0f0f10", secondary: "#f7f7f5" } },
            error: { iconTheme: { primary: "#e2001a", secondary: "#f7f7f5" } },
          }}
        />
      </body>
    </html>
  );
}
