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
          duration: 50000,
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
        className="text-6xl md:text-8xl font-serif font-medium text-[#36302A] whitespace-nowrap px-5 py-7"
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
        <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 md:bottom-0 z-10 h-[40vh] md:h-screen">
          <img
            src="/inquire-image.jpeg"
            alt="Inquire"
            className="w-full h-full object-cover"
          />

        </div>

        <div className='flex flex-col'>
          {/* Animation container */}
          <div className="w-full overflow-hidden py-7 md:py-12 h-[10vh] md:h-[30vh]">
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

          
        <form>
          hey
        </form>

  
        </div>



      </div>

    </div>
  );
};

export default Inquire;
