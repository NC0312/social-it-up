"use client";

import React from "react";
import { motion } from "framer-motion";

// How We Started Section for About
function AboutExt1() {
    const fadeInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
    };

    return (
        <>
            <section className="bg-[rgb(250,244,237)] text-[#36302A] py-12 px-6 md:px-16" style={{userSelect:"none"}}>
                <div className="container mx-auto flex flex-col md:flex-row items-start md:gap-12">
                    {/* Left Section - Heading and Description */}
                    <motion.div
                        className="w-full md:w-2/3 mb-5 text-center md:text-left"
                        variants={fadeInLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h1
                            className="text-3xl md:text-[70px] lg:text-[70px] pt-40 md:pl-10 pb-12 font-bold"
                            style={{ fontFamily: "'Noto Serif Display', serif" }}
                        >
                            How we Started...
                        </h1>
                        <p className="text-base md:text-md leading-relaxed mt-4 md:pr-72  md:pl-10">
                            Our journey began a few years ago when we—fueled by a shared passion
                            for creativity—decided to break free from the constraints of
                            traditional corporate life.
                        </p>
                        <p className="text-base md:text-md leading-relaxed mt-4 md:pr-72 md:pl-10">
                            Coming from backgrounds in the creative industry, we recognized the
                            potential to create something special together. This realization
                            sparked the birth of Social It Up, a family business where our
                            collective expertise converges to create extraordinary marketing
                            strategies and branding experiences.
                        </p>
                        <p className="text-base md:text-md leading-relaxed mt-4 md:pr-72 md:pl-10">
                            Our shared vision was simple: to create a space where creativity
                            thrives, and brands can express their true identity without
                            compromise.
                        </p>
                    </motion.div>

                    {/* Right Section - Images */}
                    <motion.div
                        className="relative w-full pt-28 md:w-1/3 flex justify-end items-center mt-8 md:mt-0"
                        variants={fadeInRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Rectangle Image */}
                        <div className="relative">
                            <img
                                src="/about1.jpeg"
                                alt="Rectangular Image"
                                className="w-[400px] h-[650px] shadow-md object-cover"
                            />
                        </div>
                        {/* Oval Image */}
                        <div className="absolute -left-12 top-1/2 transform -translate-y-1/3">
                            <img
                                src="about2.jpeg"
                                alt="Oval Image"
                                className="w-[300px] h-[500px] rounded-[50%] shadow-lg object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>
            <div className="w-screen h-[300px] mb-6 relative" style={{userSelect:"none"}}>
                <img
                    src="/strip-image.jpeg" // Replace with your image path
                    alt="Strip Image"
                    className="w-full h-full object-cover"
                />
                {/* Improved Brownish Fade Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(rgba(165, 123, 76, 0.3), rgba(165, 123, 76, 0.3))", // Uniform brownish fade
                    }}
                ></div>
            </div>

            <div className="container text-[#36302A] py-8  mx-auto flex flex-col md:flex-row items-start md:gap-12 px-6 md:px-16" style={{userSelect:"none"}}>
                {/* Left Section - Heading */}
                <motion.div
                    className="w-full md:w-1/3 text-center md:text-left"
                    variants={fadeInLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <h1
                        className="text-3xl md:text-[50px] lg:text-[50px] font-bold leading-tight mb-6"
                        style={{ fontFamily: "'Noto Serif Display', serif" }}
                    >
                        What the <br />
                        Future Holds
                    </h1>
                </motion.div>

                {/* Right Section - Paragraphs */}
                <motion.div
                    className="w-full md:w-2/3"
                    variants={fadeInRight}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <p className="text-base md:text-md leading-relaxed mb-4">
                        As we look to the future, our commitment to innovation and excellence remains unwavering. We are excited to continue evolving in the ever-changing landscape of marketing and design, embracing new technologies and trends to serve our clients better. Our goal is to not just build brands but to cultivate enduring partnerships that grow alongside them.
                    </p>
                    <p className="text-base md:text-md leading-relaxed">
                        At Social It Up, we believe that every collaboration is an opportunity to create something unforgettable, and we can&apos;t wait to embark on this journey with you. Together, let&apos;s create the extraordinary and redefine what&apos;s possible!

                    </p>
                </motion.div>
            </div>
        </>

    );
}

export default AboutExt1;
