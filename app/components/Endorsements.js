"use client";
import { useState, useEffect } from "react";

const Endorsements = () => {
    const slides = [

        { heading: "Amit C.", subheading: "Head of Product, Indo Canadian Transport Co.", text:"Our experience with Social It Up was fantastic! They truly listened to what we needed and brought our ideas to life with creativity and flair. Their problem-solving skills were top-notch, and they delivered designs that were not only visually stunning but perfectly aligned with our brand. We couldn’t have asked for a better partner in this project." },


        { heading: "Stuti K.", subheading: "Founder, local árbol", text: "From helping me come up with the name of my brand to executing a vision I couldn't even envision, Social It Up has been incredibly consistent and intuitive in their approach. They captured the essence of my brand beautifully and selected the perfect logo, making the entire process smooth and exceeding my wildest expectations. If you don’t hire them, you’re truly missing out!" },

       

        { heading: "Srijal K.", subheading: "Managing Director, Aarko Pipe", text: "We have been working with the team for over seven years, and we couldn’t be happier with the results. Our brand identity is not only distinctive but is also consistently praised within our industry. From redesigning our brand identity to managing our social media and designing our stationery, they have exceeded our expectations at every turn. Their efforts have helped us maintain a consistent and memorable brand presence." },

       
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
        <div className="bg-[#ECE4DA] py-16 overflow-x-hidden">
            <h2 className="text-center text-[30px] md:text-[45px] leading-[67px] text-[#36302A] font-serif font-bold mb-12">
                Our Endorsements
            </h2>

            <div className="max-w-7xl mx-auto px-4 overflow-hidden">
                <div className="relative">
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
                                <div className="h-[300px] w-screen pr-8 md:h-[350px] md:w-full overflow-hidden">
                                    <div className="h-full bg-[#F6F3EC] rounded-lg overflow-hidden shadow-md flex flex-col items-center justify-center px-4">
                                        <h3 className="text-xl font-semibold text-[#36302A] top-0">{slide.heading}</h3>
                                        <h4 className="text-sm text-[#36302A]">{slide.subheading}</h4>
                                        <p className="text-xs text-[#36302A] mt-6 py-1 px-6">{slide.text}</p>
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
                                    : "bg-[#FAF4ED]"} transition-colors duration-300`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Endorsements;
