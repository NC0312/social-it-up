import HomeExt1 from "./components/HomeExt1";
import LegacyCarousel from "./components/LegacyCarousel";
import QuoteSection from "./components/QuoteSection";

export default function Home() {
  return (
    <>
    <div className="flex h-screen items-center justify-center mt-[-74px] md:mt-0">
      <video
        src="/intro-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-[400px] md:w-[940px] h-[350px] md:h-[620px] object-cover translate-y-[-20px] md:translate-y-0"
      />
    </div>
    <HomeExt1/>
    <QuoteSection/>
    <LegacyCarousel/>
    </>
  );
}
