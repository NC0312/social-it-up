'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

const ServicesInfiniteScroll = () => {
  const controls = useAnimation();
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const x = useMotionValue(0);
  const text = "Let's Create Some Magic Together!";
  const lastPosition = useRef(0);
  const containerRef = useRef(null);

  const startAnimation = (startX = 0) => {
    // Calculate the width of a single text element including spacing
    const textWidth = containerRef.current?.firstChild?.offsetWidth || 2000;
    
    controls.start({
      x: [startX, -textWidth],
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

  const handleHoverStart = async () => {
    const currentX = x.get();
    lastPosition.current = currentX;
    await controls.stop();
    setIsAnimationPaused(true);
  };

  const handleHoverEnd = () => {
    startAnimation(lastPosition.current);
    setIsAnimationPaused(false);
  };

  const handleTapAnywhere = async () => {
    if (isAnimationPaused) {
      startAnimation(lastPosition.current);
    } else {
      const currentX = x.get();
      lastPosition.current = currentX;
      await controls.stop();
    }
    setIsAnimationPaused(!isAnimationPaused);
  };

  useEffect(() => {
    const handleClick = (e) => {
      // Only handle clicks outside the button
      if (!e.target.closest('button')) {
        handleTapAnywhere();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isAnimationPaused]);

  useEffect(() => {
    startAnimation(0);
  }, []);

  // Create duplicated text elements for seamless scrolling
  const textElements = [];
  // Calculate how many copies we need based on screen width
  const numberOfCopies = 8000; // Increased number of copies for smoother transition

  for (let i = 0; i < numberOfCopies; i++) {
    textElements.push(
      <span
        key={i}
        className="text-3xl md:text-6xl font-serif font-medium text-white whitespace-nowrap px-8 py-16"
      >
        {text}
      </span>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#574C3F] py-40">
      <div className="flex whitespace-nowrap" ref={containerRef}>
        <motion.div
          className="flex"
          animate={controls}
          style={{ x , cursor:"default" }}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        >
          {textElements}
        </motion.div>
      </div>

      <div 
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
        onClick={(e) => e.stopPropagation()} // Prevent button clicks from affecting animation
      >
        <button className="bg-[#B9A590] text-[#49392C] px-12 py-3 md:px-8 md:py-5 text-md rounded-xl hover:bg-[#a2907c] transition">
          Tell us about your brand!
        </button>
      </div>
    </div>
  );
};

export default ServicesInfiniteScroll;