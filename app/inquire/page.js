'use client';
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
        className="text-5xl md:text-8xl font-serif font-medium text-[#36302A] whitespace-nowrap px-5 py-7"
      >
        {text}
      </span>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Container for both animation and image */}
      <div className="flex flex-col md:flex-row relative h-screen">
        {/* Image container */}
        <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 md:bottom-0 z-10 h-[40vh] md:h-screen">
          <img
            src="/inquire-image.jpeg"
            alt="Inquire"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animation + Form container */}
        <div className="flex flex-col md:w-1/2 p-6 md:p-12 bg-[#f9f4ee]">
          {/* Animation container */}
          <div className="w-full overflow-hidden py-7 md:py-12 h-[10vh] md:h-[20vh]">
            <div
              className="flex whitespace-nowrap h-full items-center md:items-start"
              ref={containerRef}
            >
              <motion.div
                className="flex"
                animate={controls}
                style={{ x, cursor: "default", userSelect: "none" }}
              >
                {textElements}
              </motion.div>
            </div>
          </div>

          {/* Form Section */}
          <form className="space-y-6 mt-6">
            <h2 className="text-2xl md:text-4xl font-bold">
              Interested in working together?
            </h2>
            <p className="text-base md:text-lg">
              Fill out the form below, and we'll get back to you soon!
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="First Name (required)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <input
              type="email"
              placeholder="Email (required)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="tel"
              placeholder="Phone (required)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <textarea
              placeholder="Your Message"
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Submit
            </button>
            <p>Hey </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inquire;
