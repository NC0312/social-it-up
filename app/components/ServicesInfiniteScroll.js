'use client';  // Add this at the top

import React from 'react';
import { motion } from 'framer-motion';

const ServicesInfiniteScroll = () => {
  const text = "Let's Create Some Magic Together!";
  
  return (
    <div className="relative w-full overflow-hidden bg-[#574C3F] py-40">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex space-x-4"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
          whileHover={{ animationPlayState: "paused" }}
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