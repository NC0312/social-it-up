'use client';
import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { motion } from 'framer-motion';

const ServicesBranding = () => {
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
            title: 'Brand Identity',
            items: [
                {
                    title: 'Logo Design and Development',
                    description: 'Crafting a unique and memorable logo that encapsulates your brand\'s essence and values.'
                },
                {
                    title: 'Color Palette Creation',
                    description: 'Developing a cohesive color scheme that reflects your brand\'s personality and evokes the desired emotional response.'
                },
                {
                    title: 'Typography Selection',
                    description: 'Choosing fonts that align with your brand identity and enhance readability across all mediums.'
                },
                {
                    title: 'Brand Voice and Messaging Guidelines',
                    description: 'Establishing a clear and consistent tone for your brand communications to strengthen recognition and trust.'
                },
                {
                    title: 'Visual Elements (Icons, Imagery)',
                    description: 'Designing custom icons and imagery that complement your brand story and enhance visual appeal.'
                },
                {
                    title: 'Brand Style Guide',
                    description: 'Compiling all branding elements into a comprehensive style guide to ensure consistency across all platforms and materials.'
                }
            ]
        },
        {
            title: 'Packaging',
            items: [
                {
                    title: 'Product Packaging Design',
                    description: 'Designing attractive and functional packaging that reflects your brand’s identity and appeals to your target market.'
                },
                {
                    title: 'Label Design',
                    description: 'Creating eye-catching labels that convey essential product information while adhering to branding guidelines.'
                },
                {
                    title: 'Mockups',
                    description: ' Providing realistic mockups to visualize how your packaging will look in real life before production.'
                },
                {
                    title: 'Regulatory Compliance Considerations',
                    description: 'Ensuring that all packaging designs meet relevant regulatory requirements and standards for your industry.'
                }
            ]
        },
        {
            title: 'Print Media',
            items: [
                {
                    title: 'Brochures and Flyers',
                    description: 'Designing informative and visually appealing brochures and flyers that capture your brand’s message and attract attention.'
                },
                {
                    title: 'Business Cards',
                    description: 'Creating memorable business cards that leave a lasting impression and reflect your professional identity.'
                },
                {
                    title: 'Posters and Banners',
                    description: 'Developing impactful posters and banners for events, promotions, and advertisements to maximize visibility.'
                },
                {
                    title: 'Infographics',
                    description: 'Designing compelling infographics to present complex information in an easily digestible and visually engaging format.'
                },
                {
                    title: 'Stationery Design (Letterheads, Envelopes)',
                    description: 'Customizing professional stationery that enhances your brand image in all business communications.'
                },
                {
                    title: 'Annual Reports and Corporate Publications',
                    description: 'Crafting comprehensive annual reports and publications that effectively communicate your organization’s achievements and goals.'
                }
            ]
        },
        {
            title: 'Brand Collaterals',
            items: [
                {
                    title:'Business Cards',
                    description:'Designing unique business cards that facilitate networking and leave a memorable impression.'
                },
                {
                    title:'Letterhead/Envelope Design',
                    description:'Creating personalized letterheads and envelopes that elevate your correspondence and enhance brand recognition.'
                },
                {
                    title:'Sticker Design',
                    description:'Designing fun and engaging stickers that can be used for promotions or as giveaways to create buzz around your brand.'
                },
                {
                    title:'Stationery Design',
                    description:'Offering a full suite of stationery designs, including notebooks and notepads, to keep your brand front of mind.'
                },
                {
                    title:'Apparel',
                    description:'Designing branded apparel, such as t-shirts and caps, for promotional events or employee uniforms that foster brand loyalty.'
                },
                {
                    title:'Loyalty Cards',
                    description:'Creating loyalty card designs that encourage repeat business and enhance customer retention.'
                },
                {
                    title:'Thank You Cards',
                    description:'Crafting personalized thank you cards that express appreciation and strengthen customer relationships.'
                },
                {
                    title:'Gift Vouchers',
                    description:'Designing attractive gift vouchers to boost sales and incentivize purchases.'
                }
            ]
        }
    ];

    return (
        <div className="w-full py-36 h-full bg-[#ECE4DA] text-[#36302A] mx-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Branding Heading */}
            <motion.div
                                className="md:w-1/3 py-20 flex items-center justify-center h-full"
                                variants={fadeInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                <h1 className="text-5xl md:text-6xl font-semibold font-serif">Branding</h1>
                </motion.div>

            {/* List Section */}
            <div className="md:w-2/3 flex items-center justify-center h-full">
                <motion.div
                                className="space-y-4 max-w-lg w-full mx-auto"
                                variants={fadeInRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
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
                </motion.div>
            </div>
        </div>
    );
};

export default ServicesBranding;
