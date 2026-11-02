// Kratší průlet: začíná až před vchodem (snímek 236 celého průletu), bez pohledu shora
import ScrollVideo from "@/components/ScrollVideo";
import CarViewer from "@/components/CarViewer";
import Intro from "@/components/Intro";
import SmoothScroll from "@/components/SmoothScroll";

export default function KratsiVideo() {
  return (
    <SmoothScroll>
      <main>
        <ScrollVideo
          src="/video/pruchod-kratsi.mp4"
          srcTall="/video/pruchod-kratsi-vyska.mp4"
          poster="/video/pruchod-kratsi-poster.jpg"
          posterTall="/video/pruchod-kratsi-poster-vyska.jpg"
          frames={155}
          holdAt={114}
          scrollVh={250}
        >
          <Intro />
          <CarViewer />
        </ScrollVideo>
      </main>
    </SmoothScroll>
  );
}
