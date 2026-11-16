// 3D scéna je dočasně vypnutá, místo ní běží video průletu řízené scrollem
// import ShowroomScene from "@/components/Showroom";
import type { Metadata } from "next";
import ScrollVideo from "@/components/ScrollVideo";
import Intro from "@/components/Intro";
import Nabidka from "@/components/nabidka/Nabidka";
import SmoothScroll from "@/components/SmoothScroll";
import JsonLd from "@/components/web/JsonLd";
import Menu from "@/components/web/Menu";
import { NAZEV_WEBU, OG_WEBU, POPIS_WEBU, strankaLd } from "@/lib/seo";
import { nactiNabidku } from "@/sanity/lib/nabidka";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...OG_WEBU, url: "/" },
};

export default async function Home() {
  // nabídka vozů ze Sanity (cache na minuty), detail vozu a fotky se dotahují až při výběru
  const nabidka = await nactiNabidku();
  return (
    // <ShowroomScene/>
    <SmoothScroll>
      <JsonLd uzly={strankaLd({ cesta: "/", nazev: NAZEV_WEBU, popis: POPIS_WEBU, drobecky: false })} />
      <main>
        <ScrollVideo>
          <Intro />
          <Nabidka data={nabidka} />
          {/* nad vrstvou nabídky, ale v pruhu nad jejími panely (ty začínají 48 px / 61 px od horního okraje) */}
          <Menu className="absolute right-4 top-1 md:right-6 md:top-3" />
        </ScrollVideo>
      </main>
    </SmoothScroll>
  );
}
