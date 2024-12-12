'use client';
import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { motion } from 'framer-motion';

const ServicesDigitalMarketing = () => {
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
                    title: 'Link Building',
                    description: 'Strategies to gain high-quality backlinks.'
                },
                {
                    title: 'SEO Audits',
                    description: 'Regular assessments to identify areas for improvement.'
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
                    title: 'List Building',
                    description: 'Strategies for growing a subscriber list.'
                },
                {
                    title: 'Campaign Management',
                    description: 'Designing and scheduling email campaigns.'
                },
                {
                    title: 'Segmentation',
                    description: 'Tailoring content for different audience segments.'
                },
                {
                    title: 'Automation',
                    description: 'Setting up automated email sequences (welcome, follow-ups).'
                },
                {
                    title: 'Analytics and Reporting',
                    description: 'Measuring open rates, click-through rates, and conversions.'
                },
                {
                    title: 'Compliance',
                    description: 'Ensuring campaigns adhere to all legal regulations.'
                }
            ]
        },
        {
            title: 'WhatsApp for Businesses',
            items: [
                {
                    title: 'Account Setup',
                    description: 'Assistance with setting up a business profile.'
                },
                {
                    title: 'Messaging Strategies',
                    description: 'Developing effective communication strategies and creatives for customer engagement.'
                },
                {
                    title: 'Customer Support',
                    description: 'Using WhatsApp for real-time customer service.'
                },
                {
                    title: 'Broadcast Lists',
                    description: 'Sending targeted messages to specific groups.'
                },
                {
                    title: 'Integration with CRM',
                    description: 'Connecting WhatsApp with existing customer relationship management systems.'
                },
                {
                    title: 'Analytics',
                    description: 'Tracking message engagement and response rates.'
                }
            ]
        }
    ];

    return (
        <div className="w-full py-36 h-full text-[#36302A] mx-auto p-6 flex flex-col-reverse md:flex-row gap-8">
            {/* List Section */}
            {/* <div className="md:w-2/3 flex items-center justify-center h-full md:pr-64"> */}
            <motion.div
                                className="md:w-2/3 flex items-center justify-center h-full md:pr-64"
                                variants={fadeInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
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
                </motion.div>
            


            {/* <div className="md:w-1/3 py-28 flex items-center justify-center h-full md:pr-96"> */}
            <motion.div
                                className="md:w-1/3 py-28 flex items-center justify-center h-full md:pr-96"
                                variants={fadeInRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                <h1 className="text-4xl md:text-5xl font-semibold font-serif whitespace-nowrap">Digital Marketing</h1>
                </motion.div>
            {/* </div> */}

        </div>
    );
};

export default ServicesDigitalMarketing;
