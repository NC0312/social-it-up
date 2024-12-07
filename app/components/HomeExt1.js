'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import Link from 'next/link';

export default function HomeExt1() {
    const controls = useAnimation();
    const [isAnimationPaused, setIsAnimationPaused] = useState(false);
    const x = useMotionValue(0);
    const text = 'BUILD YOUR BRAND WITH US!!';
    const lastPosition = useRef(0);
    const containerRef = useRef(null);

    const startAnimation = (startX = 0) => {
        const textWidth = containerRef.current?.firstChild?.offsetWidth || 2000;
        controls.start({
            x: [startX, -textWidth],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 30000,
                    ease: 'linear',
                },
            },
        });
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
            if (!e.target.closest('button')) {
                handleTapAnywhere();
            }
        };

        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [isAnimationPaused]);

    useEffect(() => {
        startAnimation(0);
    }, []);

    const textElements = [];
    const numberOfCopies = 8000;

    for (let i = 0; i < numberOfCopies; i++) {
        textElements.push(
            <span
                key={i}
                className="text-3xl md:text-6xl font-serif font-medium text-[#36302A] whitespace-nowrap px-4 md:px-20"
            >
                {text}
            </span>
        );
    }

    return (
        <div className='mt-[-200px] md:mt-0'>
            {/* Infinite Scrolling Section */}
            <div className="relative w-full overflow-hidden bg-[#F7F4EF] py-20">
                <div className="flex whitespace-nowrap" ref={containerRef}>
                    <motion.div
                        className="flex"
                        animate={controls}
                        style={{ x, cursor: 'default', userSelect: 'none' }}
                    >
                        {textElements}
                    </motion.div>
                </div>
            </div>

            {/* Image and Content Section */}
            <div className="flex flex-col md:flex-row items-center justify-center bg-[#F7F4EF] px-6 py-16 md:px-20">
                {/* Left Image */}
                <div className="relative w-full px-6 md:px-36 md:w-1/2 z-10 mb-10 md:mb-0 -mt-[100px] md:-mt-[100px] flex justify-center">
                    <img
                        src="/home1.jpeg"
                        alt="Branding Image"
                        className="rounded-3xl shadow-md"
                        style={{

                            // maxWidth: '850px', // Max width for larger screens
                            // maxHeight: '850px', // Max height for larger screens
                            width: '100%',  // Set to full width for mobile screens
                            height: 'auto', // Adjust height proportionally for mobile screens
                            objectFit: 'cover',
                        }}
                    />
                </div>



                {/* Right Content */}
                <div className="w-full md:w-1/2 md:pl-10 md:mt-[-50px] flex flex-col items-center justify-center">
                    <p className="text-md md:text-lg text-[#36302A] mb-6">
                        In today&apos;s fast-paced market, effective branding is more than just
                        a logo or a catchy tagline; it&apos;s the essence of your business.
                        Branding shapes how consumers perceive your company, influences
                        their purchasing decisions, and builds loyalty. It tells your story,
                        communicates your values, and connects emotionally with your audience.
                    </p>
                    <p className="text-md md:text-lg text-[#36302A] mb-6">
                        At Social It Up, we understand that every detail matters. From the
                        visual identity to the messaging, each element plays a crucial role
                        in creating a cohesive brand experience. Our mission is to help
                        businesses articulate their unique identity and resonate with their
                        target audience, ultimately driving growth and success.
                    </p>
                    {/* <button className="bg-[#36302A] text-[#F6F3EE] px-6 py-3 rounded-xl transition px-20 py-6 mt-5">
                        Our Services
                    </button> */}

                    <Link href='/services'>
                        <motion.button
                            className="bg-[#36302A] text-[#F6F3EE] px-20 py-3 md:px-20 md:py-6 rounded-md md:rounded-xl transition-all mt-5"
                            initial={{ scale: 1 }}
                            whileHover={{
                                //   scale: 1.05, // Slightly increase size on hover
                                backgroundColor: '#4A3F31', // Slight color change on hover
                                // transition: { duration: 0.3 },
                            }}
                            whileTap={{
                                scale: 0.98, // Shrink the button slightly when clicked to simulate pressing
                                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)', // Slight shadow on click
                                transition: { type: 'spring', stiffness: 200, damping: 20 },
                            }}
                        >
                            Our Services
                        </motion.button>
                    </Link>

                </div>
            </div>
        </div>
    );
}
