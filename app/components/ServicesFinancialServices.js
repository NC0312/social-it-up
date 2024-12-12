'use client';
import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { motion } from 'framer-motion';

const ServicesFinancialServices = () => {
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
            title: 'GST Registrations / Returns',
            items: [
                {
                    title: 'GST Registration',
                    description: 'Assistance with the registration process to obtain GSTIN, ensuring compliance with Indian tax laws.'
                },
                {
                    title: 'Filing GST Returns',
                    description: 'Support with timely filing of GST returns (GSTR-1, GSTR-3B, etc.) to avoid penalties and maintain compliance.'
                },
                {
                    title: 'GST Reconciliation',
                    description: 'Helping businesses reconcile GST returns with input tax credits and sales records to ensure accuracy.'
                },
                {
                    title: 'Advisory Services',
                    description: 'Providing guidance on GST implications for various business transactions and strategies for tax optimization.'
                }
            ]
        },
        {
            title: 'Financial Account Management',
            items: [
                {
                    title: 'Bookkeeping Services',
                    description: 'Comprehensive bookkeeping solutions to maintain accurate financial records.'
                },
                {
                    title: 'Financial Reporting',
                    description: 'Preparation of monthly, quarterly, and annual financial statements (P&L, balance sheet, cash flow statements) to provide insights into business performance.'
                },
                {
                    title: 'Budgeting and Forecasting',
                    description: 'Assisting in creating budgets and financial forecasts to aid in strategic planning.'
                },
                {
                    title: 'Tax Compliance',
                    description: 'Ensuring compliance with income tax and other applicable tax regulations, including filing tax returns.'
                }
            ]
        },
        {
            title: 'Company Licensing / Registrations',
            items: [
                {
                    title: 'Company Registration',
                    description: 'Complete assistance in the registration process for various business structures (LLP, Pvt. Ltd., etc.) with the Ministry of Corporate Affairs.'
                },
                {
                    title: 'Licensing Support',
                    description: 'Guidance on obtaining necessary licenses and permits based on the nature of the business (trade license, FSSAI, etc.).'
                },
                {
                    title: 'Compliance Management',
                    description: 'Ongoing support to ensure compliance with regulatory requirements, including annual filings and statutory audits.'
                },
                {
                    title: 'Advisory Services',
                    description: 'Consulting on legal structures and business models to help you make informed decisions that align with your business goals.'
                }
            ]
        },
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
                <h1 className="text-4xl md:text-5xl font-semibold font-serif whitespace-nowrap">Finance Services</h1>
                </motion.div>
            {/* </div> */}

        </div>
    );
};

export default ServicesFinancialServices;
