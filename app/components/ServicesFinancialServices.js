'use client';
import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { motion } from 'framer-motion';

const ServicesFinancialServices = () => {
    const [openSection, setOpenSection] = useState('');

    const sections = [
        {
            title: 'Social Media Marketing',
            items: [
                {
                    title: 'Strategy Development',
                    description: 'Tailored social media strategies based on target audience analysis.'
                },
                {
                    title: 'Content Creation/Calendar',
                    description: 'Engaging graphics, videos, and copy for posts.'
                },
                {
                    title: 'Community Management',
                    description: 'Monitoring and responding to comments/messages.'
                },
                {
                    title: 'Social Media Advertising',
                    description: 'Paid ad campaigns on platforms like Facebook, Instagram, LinkedIn, etc.'
                },
                {
                    title: 'Analytics and Reporting',
                    description: 'Tracking performance metrics and adjusting strategies accordingly.'
                },
                {
                    title: 'Influencer Partnerships',
                    description: 'Collaborating with influencers to expand reach.'
                }
            ]
        },
        {
            title: 'SEO',
            items: [
                {
                    title: 'Keyword Research',
                    description: 'Identifying relevant keywords for target audience.'
                },
                {
                    title: 'On-Page SEO',
                    description: 'Optimizing website content, meta tags, and headings.'
                },
                {
                    title: 'Technical SEO',
                    description: 'Providing realistic mockups to visualize how your packaging will look in real life before production.'
                },
                {
                    title: 'Content Marketing',
                    description: 'Developing high-quality, SEO-optimized content.'
                },
                {
                    title:'Link Building',
                    description:'Strategies to gain high-quality backlinks.'
                },
                {
                    title:'SEO Audits',
                    description:'Regular assessments to identify areas for improvement.'
                }
            ]
        },
        {
            title: 'Adverts',
            items: [
                {
                    title: 'PPC Advertising',
                    description: 'Google Ads campaigns and management.'
                },
                {
                    title: 'Display Advertising',
                    description: 'Banner ads on relevant websites.'
                },
                {
                    title: 'Retargeting Campaigns',
                    description: 'Targeting previous website visitors with tailored ads.'
                },
                {
                    title: 'A/B Testing',
                    description: 'Experimenting with different ad formats and copy for optimization.'
                },
                {
                    title: 'Analytics and Reporting',
                    description: 'Tracking ad performance and ROI.'
                },
                {
                    title: 'Creative Development',
                    description: 'Designing eye-catching ad creatives.'
                }
            ]
        },
        {
            title: 'Email Marketing',
            items: [
                {
                    title: 'Business Cards',
                    description: 'Designing unique business cards that facilitate networking and leave a memorable impression.'
                },
                {
                    title: 'Letterhead/Envelope Design',
                    description: 'Creating personalized letterheads and envelopes that elevate your correspondence and enhance brand recognition.'
                },
                {
                    title: 'Sticker Design',
                    description: 'Designing fun and engaging stickers that can be used for promotions or as giveaways to create buzz around your brand.'
                },
                {
                    title: 'Stationery Design',
                    description: 'Offering a full suite of stationery designs, including notebooks and notepads, to keep your brand front of mind.'
                },
                {
                    title: 'Apparel',
                    description: 'Designing branded apparel, such as t-shirts and caps, for promotional events or employee uniforms that foster brand loyalty.'
                },
                {
                    title: 'Loyalty Cards',
                    description: 'Creating loyalty card designs that encourage repeat business and enhance customer retention.'
                },
                {
                    title: 'Thank You Cards',
                    description: 'Crafting personalized thank you cards that express appreciation and strengthen customer relationships.'
                },
                {
                    title: 'Gift Vouchers',
                    description: 'Designing attractive gift vouchers to boost sales and incentivize purchases.'
                }
            ]
        }
    ];

    return (
        <div className="w-full py-36 h-full text-[#36302A] mx-auto p-6 flex flex-col-reverse md:flex-row gap-8">
            {/* List Section */}
            <div className="md:w-2/3 flex items-center justify-center h-full md:pr-64">
                <div className="space-y-4 max-w-lg w-full mx-auto">
                    {sections.map((section, index) => (
                        <div
                            key={section.title}
                            className={`border-b border-[#36302A] ${index === 0 ? 'border-t pt-5' : 'pt-2'
                                }`}
                        >
                            <button
                                onClick={() =>
                                    setOpenSection(openSection === section.title ? '' : section.title)
                                }
                                className="w-full pb-4 flex justify-between items-center text-left font-serif font-thin text-2xl text-[#36302A]"
                            >
                                <span>{section.title}</span>
                                {openSection === section.title ? (
                                    <AiOutlineMinus className="w-5 h-5 text-[#36302A]" />
                                ) : (
                                    <AiOutlinePlus className="w-5 h-5 text-[#36302A]" />
                                )}
                            </button>

                            {/* Animated Dropdown */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={openSection === section.title ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="pb-4 space-y-4">
                                    <ul className="list-disc ml-8"> {/* Increased left margin for padding */}
                                        {section.items.map((item, idx) => (
                                            <li key={idx} className="mb-3"> {/* Slightly increased spacing between list items */}
                                                <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3> {/* Bolder and larger heading */}
                                                <p className="text-gray-600 text-sm mt-1 leading-tight">{item.description}</p> {/* Tighter and smaller paragraph */}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>

                        </div>
                    ))}
                </div>
            </div>


            <div className="md:w-1/3 py-28 flex items-center justify-center h-full md:pr-96">
                <h1 className="text-4xl md:text-5xl font-semibold font-serif whitespace-nowrap">Digital Marketing</h1>
            </div>

        </div>
    );
};

export default ServicesFinancialServices;
