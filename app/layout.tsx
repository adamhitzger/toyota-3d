import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Geist, Geist_Mono, Zalando_Sans_Expanded } from "next/font/google";
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
  title: "Toyota 3D showroom",
  description: "3D showroom pbočky Toyoty v Havlíčkově Brodě",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
