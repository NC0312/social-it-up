import Link from "next/link";
import React from "react";

const HeroSection = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-28 h-96 bg-[#ECE4DA]">
      <h1 className="text-4xl md:text-6xl font-serif font-semibold text-center text-[#36302A] mb-8">
        Let&apos;s build our future together
      </h1>
      <Link href='/inquire'>
      <button className="px-16 md:px-24 py-6 md:py-5 mt-8 bg-[#36302A] text-[#FAF4ED] rounded-xl md:rounded-xl md:text-md hover:bg-opacity-90">
        Contact Us
      </button>
      </Link>
    </div>
  );
};

export default HeroSection;