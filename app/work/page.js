'use client';

import React from 'react'
import WorkGrid from './Workgrid'
import { motion } from 'framer-motion';

function work() {
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
      <section className="text-center py-16 overflow-x-hidden" style={{userSelect:"none"}}>
        <motion.div
                                className="container mx-auto"
                                variants={fadeInLeft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
          <h1 className="text-7xl md:text-9xl pt-14 font-medium text-[#2e2e2e] font-serif">
            Our Clients
          </h1>
          </motion.div>
          <motion.div
                                className="container mx-auto"
                                variants={fadeInRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
          <p className="text-xl pb-10 font-bold text-[#2e2e2e] mt-4 uppercase tracking-wider">
            And Their Story.
          </p>
        </motion.div>
      </section>
      <WorkGrid />
    </>
  )
}

export default work
