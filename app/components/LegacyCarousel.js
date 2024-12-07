"use client";
import { useState, useEffect } from "react";

const LegacyCarousel = () => {
  const slides = [
    { image: "/legacy-carousel/boxongo.png", alt: "Boxongo" },
    { image: "/legacy-carousel/ecojet.png", alt: "Airplane Design" },
    { image: "/legacy-carousel/taiga-2.png", alt: "TAIGA 2" },
    { image: "/legacy-carousel/cbse.png", alt: "CBSE" },
    { image: "/legacy-carousel/taiga.png", alt: "TAIGA - Across Horizon" },
  ];

  const duplicatedSlides = [
    slides[slides.length - 1], // Add last slide at the beginning
    ...slides,
    slides[0], // Add first slide at the end
  ];

  const [currentIndex, setCurrentIndex] = useState(1); // Start at the first real slide
  const [isTransitioning, setIsTransitioning] = useState(false);

  const itemsToShow = 3; // Number of visible slides at a time

  const nextSlide = () => {
    if (isTransitioning) return; // Prevent rapid clicks
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  };

  const prevSlide = () => {
    if (isTransitioning) return; // Prevent rapid clicks
    setCurrentIndex((prev) => prev - 1);
    setIsTransitioning(true);
  };

  useEffect(() => {
    if (currentIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(duplicatedSlides.length - 2); // Jump to last real slide without transition
      }, 0);
    } else if (currentIndex === duplicatedSlides.length - 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1); // Jump to first real slide without transition
      }, 0);
    } else {
      setTimeout(() => setIsTransitioning(false), 500); // Match the duration of the transition
    }
  }, [currentIndex]);

  const handleViewMore = () => {
    window.location.href = "/work";
  };

  return (
    <div className="bg-[#FAF4ED] py-16">
      <h2 className="text-center text-[45px] leading-[67px] text-[#36302A] font-serif font-bold mb-12">
        Our Legacy
      </h2>

      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          {/* Carousel Container */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)`,
              width: `${duplicatedSlides.length * (100 / itemsToShow)}%`,
            }}
          >
            {duplicatedSlides.map((slide, index) => (
              <div
                key={index}
                className="w-[calc(100%/4)] flex-shrink-0 px-2"
              >
                <div className="h-[400px] bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="w-full h-full relative">
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center mt-8 gap-6">
            <button
              onClick={prevSlide}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-[#36302A] text-white hover:bg-[#716B64] transition-colors duration-300"
            >
              <span className="text-2xl">←</span>
            </button>
            <button
              onClick={nextSlide}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-[#36302A] text-white hover:bg-[#716B64] transition-colors duration-300"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>
        </div>

        {/* View More Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleViewMore}
            className="px-8 py-4 bg-[#36302A] text-white rounded-xl hover:bg-[#716B64] transition-colors duration-300 font-light"
          >
            View More
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegacyCarousel;
