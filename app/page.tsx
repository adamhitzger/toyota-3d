// 3D scéna je dočasně vypnutá, místo ní běží video průletu řízené scrollem
// import ShowroomScene from "@/components/Showroom";
import ScrollVideo from "@/components/ScrollVideo";
import Intro from "@/components/Intro";
import Nabidka from "@/components/nabidka/Nabidka";
import SmoothScroll from "@/components/SmoothScroll";
import { nactiNabidku } from "@/sanity/lib/nabidka";

export default async function Home() {
  // nabídka vozů ze Sanity (cache na minuty), detail vozu a fotky se dotahují až při výběru
  const nabidka = await nactiNabidku();
  return (
    // <ShowroomScene/>
    <SmoothScroll>
      <main>
        <ScrollVideo>
          <Intro />
          <Nabidka data={nabidka} />
        </ScrollVideo>
      </main>
    </SmoothScroll>
  );
}
