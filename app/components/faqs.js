'use client';
import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";

const FAQs = () => {
    const [openSection, setOpenSection] = useState('');

    const sections = [
        {
            title: 'What services do you offer?',
            description: 'We provide a comprehensive range of services including branding, marketing strategy, web design, graphic design, social media management, and content creation. Our goal is to help you build a cohesive and impactful online presence.'
        },
        {
            title: 'How do you approach branding projects?',
            description: 'Our branding process involves thorough research to understand your business, audience, and market trends. We collaborate with you to develop a custom package that fits your unique needs. Most of them include brand identity, including logo design, colour palettes, typography, and brand guidelines.'
        },
        {
            title: 'How long does a typical project take?',
            description: 'Project timelines vary depending on the scope and complexity. Branding projects usually take 2-4 weeks, while web design entirely depends on the project. We\'ll provide a detailed timeline during the initial consultation.'
        },
        {
            title: 'How can I get started?',
            description: 'Getting started is easy! Simply reach out via our contact form or give us a call. We\'ll schedule a consultation to discuss your goals, and how we can help bring your vision to life.'
        }
    ];

    return (
        <div className="w-full py-10 h-full bg-[#FAF4ED] text-[#36302A] mx-auto p-6 flex flex-col md:flex-row gap-5 md:gap-48">
            {/* FAQS HEADING */}
            <div className="md:w-1/3 py-20 flex items-center justify-center h-full">
                <h1 className="text-5xl md:text-6xl font-[700] leading-[60px] text-[rgb(54,48,42)] font-serif">FAQs</h1> {/* Title with specified font settings */}
            </div>

            {/* List Section */}
            <div className="md:w-[45%] px-5 flex items-center justify-center h-full scale-110">
                <div className="space-y-2 md:space-y-4 w-full mx-auto">
                    {sections.map((section, index) => (
                        <div
                            key={section.title}
                            className={`border-b border-[#36302A] text-[#36302A] text-[13px] md:text-[26px] font-thin ${index === 0 ? 'border-t pt-5' : 'pt-2'}`}
                        >
                            {/* Accordion Title */}
                            <button
                                onClick={() =>
                                    setOpenSection(openSection === section.title ? '' : section.title)
                                }
                                className="w-full pb-4 flex justify-between items-center text-left font-serif text-[#36302A] focus:outline-none"
                            >
                                <span>{section.title}</span>
                                {openSection === section.title ? (
                                    <IoIosArrowUp className="w-5 h-5 text-[#36302A]" />
                                ) : (
                                    <IoIosArrowDown  className="w-5 h-5 text-[#36302A]" />
                                )}
                            </button>

                            {/* Animated Dropdown */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={openSection === section.title ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="pb-4 px-6 space-y-4">
                                    <p className="ml-8 text-[#36302A] text-[10px] md:text-sm mt-1 leading-relaxed tracking-wide">{section.description}</p>
                                </div>
                            </motion.div>

                            {/* Divider */}
                            <div className="accordion-divider" aria-hidden="true" style={{ height: '1px', opacity: '0.5' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQs;