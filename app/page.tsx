// 3D scéna je dočasně vypnutá, místo ní běží video průletu řízené scrollem
// import ShowroomScene from "@/components/Showroom";
import ScrollVideo from "@/components/ScrollVideo";
import CarViewer from "@/components/CarViewer";
import Intro from "@/components/Intro";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    // <ShowroomScene/>
    <SmoothScroll>
      <main>
        <ScrollVideo>
          <Intro />
          <CarViewer />
        </ScrollVideo>
      </main>
    </SmoothScroll>
  );
}
