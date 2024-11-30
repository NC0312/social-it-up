'use client';  // Add this at the top

import React from 'react';
import { motion, useAnimation } from 'framer-motion';

const ServicesInfiniteScroll = () => {
  const controls = useAnimation(); // Controls the animation
  const text = "Let's Create Some Magic Together!";

  const handleHoverStart = () => {
    controls.stop(); // Stop animation on hover
  };

  const handleHoverEnd = () => {
    controls.start({
      x: [0, -1000],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 20,
        ease: "linear",
      },
    });
  };

  // Start the animation initially
  React.useEffect(() => {
    controls.start({
      x: [0, -1000],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 20,
        ease: "linear",
      },
    });
  }, [controls]);

  return (
    <div className="relative w-full overflow-hidden bg-[#574C3F] py-40">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex space-x-4 cursor-default" // Prevents cursor from changing
          animate={controls} // Controlled animation
          onHoverStart={handleHoverStart} // Pause on hover
          onHoverEnd={handleHoverEnd} // Resume on hover end
        >
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="text-6xl font-bold text-white whitespace-nowrap"
            >
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ServicesInfiniteScroll;
