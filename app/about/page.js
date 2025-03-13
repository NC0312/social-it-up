"use client";

import React from "react";
import { motion } from "framer-motion";
import AboutExt1 from "../components/About/AboutExt1";

const About = () => {
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
            <section className="bg-[#ECE4DA] text-[#36302A] py-24 px-4 md:px-16 max-w-full" style={{userSelect:"none"}}>
                <div className="container mx-auto flex flex-col md:flex-row items-center md:items-start">
                    {/* Left Section - Heading */}
                    <motion.div
                        className="w-full md:w-1/3 mb-5 md:pt-5 md:pr-8 text-center md:text-left"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h1
                            className="text-4xl lg:text-[50px] pt-12 md:text-[60px] font-bold pb-6 break-words"
                            style={{ fontFamily: "'Noto Serif Display', serif" }}
                        >
                            Who are we?
                        </h1>
                    </motion.div>

                    {/* Right Section - Description */}
                    <motion.div
                        className="w-full md:w-2/3 text-base md:text-md leading-relaxed px-4 md:pl-48 md:pr-44 md:pt-16 md:pb-16 mt-4 md:mt-0 text-center md:text-left"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <p>
                            At Social It Up, we are a dynamic family-run creative agency dedicated to empowering brands to make bold, impactful statements. Our team comprises seasoned professionals with diverse expertise in marketing, branding, web design, and finance.
                        </p>
                        <motion.p
                            className="mt-4"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            We blend our skills to offer innovative solutions tailored to each client&apos;s unique needs. With a passion for creativity and a commitment to excellence, we strive to cultivate lasting relationships with our clients, ensuring that their visions are not only realised but celebrated.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <AboutExt1 />
            </motion.div>
        </>
    );
};

export default About;