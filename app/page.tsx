// 3D scéna je dočasně vypnutá, místo ní běží video průletu řízené scrollem
// import ShowroomScene from "@/components/Showroom";
import ScrollVideo from "@/components/ScrollVideo";
import CarViewer from "@/components/CarViewer";

export default function Home() {
  return (
    // <ShowroomScene/>
    <main>
      <ScrollVideo>
        <CarViewer />
      </ScrollVideo>
    </main>
  );
}
