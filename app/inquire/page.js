'use client'
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

const Inquire = () => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const text = "Contact Us";
  const containerRef = useRef(null);

  const startAnimation = () => {
    const textWidth = containerRef.current?.firstChild?.offsetWidth || 2000;

    controls.start({
      x: [0, -textWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 25000,
          ease: "linear",
        },
      },
    });
  };

  useEffect(() => {
    startAnimation();
  }, []);

  const textElements = [];
  const numberOfCopies = 8000;

  for (let i = 0; i < numberOfCopies; i++) {
    textElements.push(
      <span
        key={i}
        className="text-5xl md:text-8xl font-serif font-medium text-[#36302A] whitespace-nowrap px-5 py-7"
      >
        {text}
      </span>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Container for both animation and image */}
      <div className="flex flex-col md:flex-row relative h-[40vh] md:h-screen">
        {/* Image container */}
        <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 md:bottom-0 z-10 h-[25vh] md:h-screen">
          <img
            src="/inquire-image.jpeg"
            alt="Inquire"
            className="w-full h-full object-cover"
          />
        </div>

        <div className='flex flex-col'>
          {/* Animation container */}
          <div className="w-screen overflow-hidden py-10 md:py-24 h-[10vh] md:h-[30vh]">
            <div className="flex whitespace-nowrap h-full items-center md:items-start" ref={containerRef}>
              <motion.div
                className="flex"
                animate={controls}
                style={{ x, cursor: "default", userSelect: "none" }}
              >
                {textElements}
              </motion.div>


            </div>
          </div>


          <form className='overflow-x-hidden px-6 md:px-10 w-full md:w-1/2 py-5 md:py-14'>
            <p className='text-[#36302A] text-sm md:text-lg'>Interested in working together? Fill out some info and we will be in touch shortly! We can&apos;t wait to hear from you!</p>

            <p className=" md:text-md !important pt-5 md:pt-10 text-[#36302A]">
              Name<span className='text-sm text-[#86807A] ml-1'> (required)</span>
            </p>

            <div className='flex flex-row py-1 md:py-2'>
              {/* Div for firstName */}
              <div className="flex flex-col">
                <label className="text-sm text-[#36302A]">First Name</label>
                <input
                  className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 w-44 md:w-80 py-1 rounded-lg" required
                />
              </div>

              {/* Div for lastName */}
              <div className="flex flex-col ml-3">
                <label className="text-sm text-[#36302A]">Last Name</label>
                <input
                  className="bg-[#EFE7DD] text-[#36302A] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#36302A] hover:border-[#36302A] px-3 w-44 md:w-80 py-1 rounded-lg"
                />
              </div>

            </div>

          </form>


        </div>



      </div>

    </div>
  );
};

export default Inquire;
