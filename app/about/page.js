"use client";

import React from "react";
import AboutExt1 from "../components/AboutExt1";

function About() {
  return (
    <>
    <section className="bg-[#ECE4DA] text-[#36302A] py-24 px-6 md:px-16">
      <div className="container mx-auto flex flex-col md:flex-row items-center md:items-start">
        {/* Left Section - Mobile: Top, Desktop: Left */}
        <div className="w-full md:w-1/3 mb-5 md:pt-5 md:pr-8 text-center md:text-left">
          <h1
            className="text-4xl lg:text-[50px] pt-12 md:text-[60px] font-bold pb-6"
            style={{ fontFamily: "'Noto Serif Display', serif" }}
          >
            Who are we?
          </h1>
        </div>

        {/* Right Section - Mobile: Below Heading, Desktop: Right Side */}
        <div className="w-full md:w-2/3 text-base md:text-md leading-relaxed md:pl-48 md:pr-44 md:pt-16 md:pb-16 mt-4 md:mt-0 text-center md:text-left">
          <p>
            At Social It Up, we are a dynamic family-run creative agency dedicated to empowering brands to make bold, impactful statements. Our team comprises seasoned professionals with diverse expertise in marketing, branding, web design, and finance.
          </p>
          <p className="mt-4">
          We blend our skills to offer innovative solutions tailored to each client&apos;s unique needs. With a passion for creativity and a commitment to excellence, we strive to cultivate lasting relationships with our clients, ensuring that their visions are not only realised but celebrated.
          </p>
        </div>
      </div>
    </section>
    <AboutExt1/>
    </>
  );
}

export default About;