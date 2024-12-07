'use client'
import { motion } from 'framer-motion';

const QuoteSection = () => {
  return (
    <div className="bg-[#36302A] text-[#F6F3EE] py-40 px-8 text-center">
      <p className="text-6xl font-serif font-medium mb-6">
        &quot;Branding is not just about being seen,
      </p>
      <p className="text-lg md:text-2xl font-serif mb-6">
        it&apos;s about being remembered.&quot;
        
      </p>

       {/* Animated Line */}
       <motion.div
        className="relative inline-block mt-0"
        initial={{ width: 0, rotate: 0 }}
        whileInView={{
          width: '13%',
          rotate: -3, // Slight tilt
          transition: { duration: 2, ease: 'easeInOut' },
        }}
        viewport={{ once: true }}
      >
        <div className="h-[2px] bg-[#998877] absolute bottom-[35px] left-[45px] w-full sm-[20%]"></div>
      </motion.div>
      
    </div>
  );
};

export default QuoteSection;
