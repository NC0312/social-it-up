"use client";

import React from "react";

// How We Started Section for About
function AboutExt1() {
    return (
        <>
            <section className="bg-[rgb(250,244,237)] text-[#36302A] py-12 px-6 md:px-16">
                <div className="container mx-auto flex flex-col md:flex-row items-start md:gap-12">
                    {/* Left Section - Heading and Description */}
                    <div className="w-full md:w-2/3 mb-5 text-center md:text-left">
                        <h1
                            className="text-3xl md:text-[70px] lg:text-[70px] pt-40 pl-10 pb-12 font-bold"
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
                    </div>

                    {/* Right Section - Images */}
                    <div className="relative w-full pt-28 md:w-1/3 flex justify-end items-center mt-8 md:mt-0">
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
                    </div>
                </div>
            </section>
            <div className="w-screen h-[300px] mb-6 relative">
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





        </>

    );
}

export default AboutExt1;
