'use client';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import ServicesBranding from '../components/Services/ServicesBranding';
import ServicesDigitalMarketing from '../components/Services/ServicesDigitalMarketing';
import ServicesWebsite from '../components/Services/ServicesWebsite';
import ServicesFinancialServices from '../components/Services/ServicesFinancialServices';
import ServicesInfiniteScroll from '../components/Services/ServicesInfiniteScroll';

const Services = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const tileHover = {
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 }
  };

  return (
    <main className="w-full" style={{ userSelect: "none" }}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-screen"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/city-image.jpg')",
            filter: "brightness(0.95)"
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.65)"
          }}
        />

        <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center h-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-9xl lg:text-9xl font-light text-[#2e2e2e] font-serif mb-8 text-center"
          >
            Every Brand has a Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl pb-10 font-bold text-[#2e2e2e] mt-0 uppercase tracking-wider"
          >
            MAKE IT STAND OUT.
          </motion.p>
        </div>
      </motion.section>

      {/* Offerings Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="container mx-auto py-48 px-12 md:px-24"
      >
        <motion.h2
          variants={fadeIn}
          className="text-3xl md:text-4xl lg:text-4xl font-semibold font-serif text-center text-[#2e2e2e] mb-16"
        >
          Our Offerings
        </motion.h2>

        <motion.div
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Tile 1 */}
          <motion.div
            variants={fadeIn}
            whileHover={tileHover}
            className="p-4 md:p-14 bg-[#ECE4DA] text-center select-none"
          >
            <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
              Branding
            </h3>
            <p className="text-[#36302A] text-sm">
              This is the foundation of your business identity. It&apos;s more than just a logo; it&apos;s how you communicate your values, mission, and personality to your audience. We help you craft a compelling brand narrative, develop a cohesive visual identity, and create memorable experiences that resonate with your target market. Together, we&apos;ll build a brand that stands out and fosters loyalty.
            </p>
          </motion.div>

          {/* Tile 2 */}
          <motion.div
            variants={fadeIn}
            whileHover={tileHover}
            className="p-4 md:p-14 bg-[#ECE4DA] text-center select-none"
          >
            <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
              Digital Marketing
            </h3>
            <p className="text-[#36302A] text-sm">
              This encompasses a range of strategies designed to promote your brand online. From SEO and content marketing to social media campaigns and email outreach, we tailor our approach to maximize your reach and engagement. Our goal is to connect you with your audience, drive traffic to your website, and convert leads into customers whilst building a strong presence.
            </p>
          </motion.div>

          {/* Tile 3 */}
          <motion.div
            variants={fadeIn}
            whileHover={tileHover}
            className="p-4 md:p-14 bg-[#ECE4DA] text-center select-none"
          >
            <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
              Website
            </h3>
            <p className="text-[#36302A] text-sm">
              This is where aesthetics meet functionality. We create visually stunning and user-friendly websites that not only look great but also perform seamlessly. Our designs are tailored to your specific needs, ensuring an intuitive user experience across all devices. From using website builders to building one from scratch, we deliver solutions that elevate your brand and drive results.
            </p>
          </motion.div>

          {/* Tile 4 */}
          <motion.div
            variants={fadeIn}
            whileHover={tileHover}
            className="p-4 md:p-14 bg-[#ECE4DA] text-center select-none"
          >
            <h3 className="text-xl font-light font-serif text-[#36302A] mb-4">
              Finance Services
            </h3>
            <p className="text-[#36302A] text-sm">
              At Social It Up, we understand that strong financial management is the backbone of any successful business. In the Indian market, navigating financial regulations and ensuring compliance can be a daunting task. That&apos;s why we offer a range of comprehensive financial services tailored to meet the needs of businesses of all sizes.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Story Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative h-[500px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/service1.jpeg')",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#2E2A25",
              opacity: 0.8,
            }}
          />
        </div>

        <div className="relative pt-5 z-10 h-full flex flex-col items-center justify-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl lg:text-7xl text-[#D9D9D9] font-serif font-medium text-center max-w-6xl leading-tight mb-12 tracking-tight"
          >
            Whatever it is, the way you tell your story online can make all the difference.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/inquire">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#B9A590] text-[#46423D] px-32 py-4 md:px-20 md:py-6 rounded-lg md:rounded-2xl text-md font-medium hover:opacity-90 transition-opacity duration-300"
              >
                Make It
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Service Components */}
      <ServicesBranding />
      <ServicesDigitalMarketing />
      <ServicesWebsite />
      <ServicesFinancialServices />
      <ServicesInfiniteScroll />
    </main>
  );
};

export default Services;