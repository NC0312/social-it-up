'use client';
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

import Endorsements from "./components/Home/Endorsements";
import FAQs from "./components/Home/faqs";
import HeroSection from "./components/Home/HeroSection";
import HomeExt1 from "./components/Home/HomeExt1";
import LegacyCarousel from "./components/Home/LegacyCarousel";
import OurServices from "./components/Home/OurServices";
import QuoteSection from "./components/Home/QuoteSection";

// const fadeInUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
// };

const Home = () => {
  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
  };
  const videoRef = useRef(null);
  const isVideoInView = useInView(videoRef, { once: true });

  return (
    <>
      {/* Intro Video Section */}
      <motion.div
        ref={videoRef}
        initial="hidden"
        animate={isVideoInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="flex h-screen items-center justify-center mt-[-74px] md:mt-0"
      >
        <video
          src="/intro-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-[400px] md:w-[940px] h-[350px] md:h-[620px] object-cover translate-y-[-20px] md:translate-y-0"
        />
      </motion.div>

      {/* Sections */}
      {[
        { Component: HomeExt1 },
        { Component: QuoteSection },
        { Component: LegacyCarousel },
        { Component: Endorsements },
        { Component: OurServices },
        { Component: FAQs },
        { Component: HeroSection },
      ].map(({ Component }, index) => (
        <motion.div
          key={index}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <Component />
        </motion.div>
      ))}
    </>
  );
};

export default Home;
