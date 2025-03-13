"use client";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';

const LegacyCarousel = () => {
    const slides = [
        { image: "/legacy-carousel/boxongo.png", alt: "Boxongo", name: "Boxongo" },
        { image: "/legacy-carousel/ecojet.png", alt: "Airplane Design", name: "Ecojet" },
        { image: "/legacy-carousel/taiga-2.png", alt: "TAIGA 2", name: "TAIGA 2" },
        {image:"/work-images/image3.png",alt:"indo canadian",name:"Indo Canadian"},
        { image: "/legacy-carousel/taiga.png", alt: "TAIGA - Across Horizon", name: "TAIGA - Across Horizon" },
    ];

    const duplicatedSlides = [
        slides[slides.length - 1], // Add last slide at the beginning
        ...slides,
        slides[0], // Add first slide at the end
    ];

    const [currentIndex, setCurrentIndex] = useState(1); // Start at the first real slide
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect if the viewport is mobile
    useEffect(() => {
        const updateView = () => setIsMobile(window.innerWidth < 768);
        updateView(); // Run on component mount
        window.addEventListener("resize", updateView);
        return () => window.removeEventListener("resize", updateView);
    }, []);

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
        <div className="bg-[#FAF4ED] py-16 overflow-x-hidden" style={{userSelect:"none"}}>
            <h2 className="text-center text-[45px] leading-[67px] text-[#36302A] font-serif font-bold mb-12">
                Our Legacy
            </h2>

            <div className="max-w-7xl mx-auto px-4 overflow-hidden">
                <div className="relative">
                    {/* Carousel Container */}
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * (isMobile ? 100 : 25)}%)`,
                            width: `${duplicatedSlides.length * (isMobile ? 75 : 25)}%`,
                        }}
                    >
                        {duplicatedSlides.map((slide, index) => (
                            <div
                                key={index}
                                className={`flex-shrink-0 ${isMobile ? "w-full" : "w-[calc(100%/4)]"}`}
                            >
                                <div className="h-[200px] w-screen pr-8 md:h-[300px] md:w-full overflow-hidden">
                                    <div className="h-full bg-white rounded-lg overflow-hidden shadow-md group">
                                        <div className="relative h-full cursor-pointer">
                                            <img
                                                src={slide.image}
                                                alt={slide.alt}
                                                className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                                            />
                                            {/* Company Name Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 transition-opacity duration-300">
                                                <h3 className="text-white text-lg font-semibold" style={{userSelect:"none"}}>{slide.name}</h3>
                                            </div>
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
                            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#36302A] md:bg-[#716B64] text-white md:hover:bg-[#36302A] transition-colors duration-300"
                        >
                            <span className="text-2xl">←</span>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#36302A] md:bg-[#716B64] text-white md:hover:bg-[#36302A] transition-colors duration-300"
                        >
                            <span className="text-2xl">→</span>
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
                    <motion.button
                        className="bg-[#36302A] text-[#F6F3EE] px-20 py-3 md:px-12 md:py-5 rounded-md md:rounded-xl transition-all mt-5"
                        onClick={handleViewMore}
                        initial={{ scale: 1 }}
                        whileHover={{
                            backgroundColor: '#4A3F31',
                        }}
                        whileTap={{
                            scale: 0.98,
                            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
                            transition: { type: 'spring', stiffness: 200, damping: 20 },
                        }}
                    >
                        View more
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default LegacyCarousel;
