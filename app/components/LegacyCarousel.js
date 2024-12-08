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
    const [isMobile, setIsMobile] = useState(false);
    const [startX, setStartX] = useState(0);
    const [endX, setEndX] = useState(0);

    // Detect if the viewport is mobile
    useEffect(() => {
        const updateView = () => setIsMobile(window.innerWidth < 768);
        updateView(); // Run on component mount
        window.addEventListener("resize", updateView);
        return () => window.removeEventListener("resize", updateView);
    }, []);

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setEndX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (isTransitioning) return;

        const swipeDistance = startX - endX;
        const swipeThreshold = 50; // Minimum swipe distance to trigger navigation

        if (swipeDistance > swipeThreshold) {
            // Swipe left, move to the next slide
            nextSlide();
        } else if (swipeDistance < -swipeThreshold) {
            // Swipe right, move to the previous slide
            prevSlide();
        }

        // Reset swipe state
        setStartX(0);
        setEndX(0);
    };

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

    const handleDotClick = (index) => {
        if (isTransitioning) return; // Prevent rapid clicks
        setCurrentIndex(index + 1); // Adjust for duplicated slides
        setIsTransitioning(true);
    };

    const handleViewMore = () => {
        window.location.href = "/work";
    };

    return (
        <div className="bg-[#FAF4ED] py-16 overflow-x-hidden">
            <h2 className="text-center text-[45px] leading-[67px] text-[#36302A] font-serif font-bold mb-12">
                Our Legacy
            </h2>

            {/* Added overflow-hidden to prevent x-axis overflow on mobile */}
            <div className="max-w-7xl mx-auto px-4 overflow-hidden">
                <div className="relative">
                    {/* Carousel Container */}
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * (isMobile ? 100 : 25)}%)`,
                            width: `${duplicatedSlides.length * (isMobile ? 75 : 25)}%`,
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {duplicatedSlides.map((slide, index) => (
                            <div
                                key={index}
                                className={`flex-shrink-0 ${isMobile ? "w-full" : "w-[calc(100%/4)]"}`}
                            >
                                <div className="h-[200px] w-screen pr-8 md:h-[400px] md:w-full overflow-hidden flex-shrink-0 md:px-2">
                                    <div className="h-full bg-white rounded-lg overflow-hidden shadow-md">
                                        <div className="relative h-full">
                                            <img
                                                src={slide.image}
                                                alt={slide.alt}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center items-center mt-8 gap-6">
                        <button
                            onClick={prevSlide}
                            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#36302A]  md:bg-[#716B64] text-white md:hover:bg-[#36302A] transition-colors duration-300"
                        >
                            <span className="text-lg md:text-2xl">←</span>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#36302A] md:bg-[#716B64] text-white md:hover:bg-[#36302A] transition-colors duration-300"
                        >
                            <span className="text-lg md:text-2xl">→</span>
                        </button>
                    </div>

                    {/* Owl Dots */}
                    <div className="flex justify-center mt-6 space-x-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${currentIndex - 1 === index
                                    ? "bg-[#36302A]"
                                    : "bg-[#E0E0E0]"
                                    } transition-colors duration-300`}
                            />
                        ))}
                    </div>
                </div>

                {/* View More Button */}
                <div className="flex justify-center mt-8 md:mt-12">
                    <button
                        onClick={handleViewMore}
                        className="px-20 py-3 md:px-8 md:py-5 bg-[#36302A] text-sm text-white rounded-md md:rounded-xl hover:bg-[#716B64] transition-colors duration-300 font-light"
                    >
                        View More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegacyCarousel;
