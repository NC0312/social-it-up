'use client';
import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { motion } from 'framer-motion';

const ServicesWebsite = () => {
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
            title: 'Website Development',
            items: [
                {
                    title: 'Custom Website Design',
                    description: 'Tailored designs that reflect brand identity and engage audiences effectively.'
                },
                {
                    title: 'Responsive Web Development',
                    description: 'Ensuring websites look and function seamlessly on all devices, from desktops to smartphones.'
                },
                {
                    title: 'E-commerce Solutions',
                    description: 'Creating user-friendly online stores with secure payment options to enhance the shopping experience.'
                },
                {
                    title: 'Content Management Systems (CMS)',
                    description: 'Implementing platforms like WordPress or Joomla for easy content updates and management without technical expertise.'
                },
                {
                    title: 'SEO Optimization',
                    description: 'Integrating best practices to improve website visibility on search engines, driving organic traffic.'
                },
                {
                    title: 'Website Maintenance and Support',
                    description: 'Ongoing assistance to keep websites updated, secure, and performing optimally.'
                },
                {
                    title: 'Performance Optimization',
                    description: 'Enhancing load times and overall user experience to keep visitors engaged and reduce bounce rates.'
                },
                {
                    title: 'Web Application Development',
                    description: 'Building interactive web applications that provide unique functionalities tailored to specific business needs.'
                }
            ]
        },
        {
            title: 'App Development',
            items: [
                {
                    title: 'iOS App Development',
                    description: 'Creating high-performance applications tailored for Apple devices, ensuring seamless user experiences and adherence to App Store guidelines.'
                },
                {
                    title: 'Android App Development',
                    description: 'Developing intuitive applications for Android devices, optimized for a wide range of screen sizes and OS versions.'
                },
                {
                    title: 'Cross-Platform App Development',
                    description: 'Utilizing frameworks like React Native or Flutter to build apps that work on both iOS and Android, reducing development time and costs.'
                },
                {
                    title: 'UI/UX Design',
                    description: 'Crafting engaging user interfaces and experiences that enhance usability and drive user engagement across all app platforms.'
                },
                {
                    title: 'API Integration',
                    description: 'Implementing third-party APIs to enhance app functionality, allowing for features like payment processing, social media sharing, and data syncing.'
                },
                {
                    title: 'App Maintenance and Support',
                    description: 'Providing ongoing support and updates to ensure apps remain functional, secure, and compatible with the latest operating system changes.'
                },
                {
                    title: 'App Testing and Quality Assurance',
                    description: 'Conducting thorough testing to identify and fix bugs, ensuring high performance and reliability before launch.'
                },
                {
                    title: 'Consultation and Strategy',
                    description: 'Offering expert guidance on app ideas, market research, and development strategies to help bring innovative concepts to life.'
                }
            ]
        },
        {
            title: 'UI/UX',
            items: [
                {
                    title: 'User Research and Analysis',
                    description: 'Conducting thorough research to understand user needs, preferences, and behaviors, informing design decisions.'
                },
                {
                    title: 'Wireframing and Prototyping',
                    description: 'Creating low-fidelity wireframes and interactive prototypes to visualize layout and functionality before development.'
                },
                {
                    title: 'Visual Design',
                    description: 'Developing aesthetically pleasing designs that align with brand identity and enhance user engagement.'
                },
                {
                    title: 'Usability Testing',
                    description: 'Performing tests with real users to identify pain points and areas for improvement, ensuring optimal user experience.'
                },
                {
                    title: 'Responsive Design',
                    description: 'Designing interfaces that adapt seamlessly across various devices and screen sizes, providing a consistent experience.'
                },
                {
                    title: 'Information Architecture',
                    description: 'Structuring content and navigation to enhance usability, making it easy for users to find what they need.'
                },
                {
                    title: 'Interaction Design',
                    description: 'Focusing on how users interact with the interface, creating intuitive and engaging interactions that enhance usability.'
                },
                {
                    title: 'Design System Development',
                    description: 'Establishing a cohesive design system with guidelines, components, and styles to ensure consistency across all platforms.'
                }
            ]
        },
        {
            title: 'Website Hosting',
            items: [
                {
                    title: 'Managed WordPress Hosting',
                    description: 'Optimized environments for WordPress sites, featuring automatic updates, enhanced security, and dedicated support.'
                },
                {
                    title: 'Squarespace Hosting',
                    description: 'Simplified hosting integrated with Squarespace’s design tools, perfect for creating visually appealing websites without technical hassles.'
                },
                {
                    title: 'AWS Cloud Hosting',
                    description: 'Scalable and flexible hosting solutions leveraging Amazon Web Services for high-performance websites that can handle varying traffic loads.'
                },
                {
                    title: 'E-commerce Hosting on WordPress',
                    description: 'Specialized hosting plans for WordPress e-commerce sites, ensuring fast load times and secure transactions.'
                },
                {
                    title: 'Website Migration Services',
                    description: 'Seamless migration support for transferring existing sites to WordPress, Squarespace, or AWS with minimal downtime.'
                },
                {
                    title: 'SSL Certificates and Security',
                    description: 'Provisioning SSL certificates and implementing security measures to protect websites and user data across all platforms.'
                },
                {
                    title: 'Performance Monitoring',
                    description: 'Regular performance checks and optimizations to ensure websites run smoothly and efficiently on chosen hosting platforms.'
                }
            ]
        }
    ];

    return (
        <div className="w-full py-36 h-full bg-[#ECE4DA] text-[#36302A] mx-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Branding Heading */}
            {/* <div className="md:w-1/3 py-20 flex items-center justify-center h-full"> */}
              <motion.div
                                            className="md:w-1/3 py-20 flex items-center justify-center h-full"
                                            variants={fadeInLeft}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true }}
                                        >
                <h1 className="text-5xl md:text-6xl font-semibold font-serif">Website</h1>
                </motion.div>
            {/* </div> */}

            {/* List Section */}
            <div className="md:w-2/3 flex items-center justify-center h-full">
                {/* <div className="space-y-4 max-w-lg w-full mx-auto"> */}
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

export default ServicesWebsite;
