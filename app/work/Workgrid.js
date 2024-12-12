'use client';
import { motion } from 'framer-motion';
import React from "react";

const WorkPageGrid = () => {
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
  const works = [
    {
      src: "/work-images/image1.png",
      alt: "Eco Jet",
      bgcolor: "bg-[#8B1818]", // deep red background
    },
    {
      src: "/work-images/image2.png",
      alt: "Safar",
      bgcolor: "bg-[#003B5C]", // deep blue background
    },
    {
      src: "/work-images/image3.png",
      alt: "Indo Canadian Transport Co.",
      bgcolor: "bg-[#2E1A47]", // purple background
    },
    {
      src: "/work-images/image4.png",
      alt: "Taiga",
      bgcolor: "bg-[#1B4D2E]", // green background
    },
    {
      src: "/work-images/image5.png",
      alt: "Machan",
      bgcolor: "bg-[#1C1C1C]", // dark background
    },
    {
      src: "/work-images/image6.png",
      alt: "Box Ongo",
      bgcolor: "bg-[#0A4B8F]", // royal blue background
    },
    {
        src: "/work-images/image7.png",
        alt:"Wise Monkeys",
    },
    {
        src:"/work-images/image8.png",
        alt:"pretty knots",
    }
  ];

  return (
    <section className="bg-[#ECE4DA] min-h-screen py-16">
      <div className="container mx-auto px-2 sm:px-4 md:px-6">
      <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> */}
          {works.map((work, index) => (
            <div
              key={index}
              className={`relative overflow-hidden group cursor-pointer ${work.bgcolor}`}
              style={{ paddingBottom: "135%" }}
            >
              <img
                src={work.src}
                alt={work.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
            </div>
          ))}
          </motion.div>
        {/* </div> */}
      </div>
    </section>
  );
};

export default WorkPageGrid;