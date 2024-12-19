'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[rgb(250,244,237)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Text with Warning Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <h1 className="text-8xl font-bold text-[#36302A]">404</h1>
          <AlertTriangle size={64} className="text-[#36302A]" />
        </motion.div>

        {/* Animated Image */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="my-8"
        >
          <div className="relative w-64 h-64 mx-auto">
            <Image
              src="/logo.png"
              alt="404 Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Animated Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-semibold text-[#36302A]">
            Oops! Page Not Found
          </h2>
          <p className="text-[#36302A] text-lg max-w-md mx-auto">
            The page you're looking for seems to have wandered off. Let's get you back on track.
          </p>
        </motion.div>

        {/* Animated Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8"
        >
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-[#36302A] text-white rounded-lg font-medium 
                     transition-all duration-300 hover:bg-[#36302A]/80 
                     hover:translate-y-[-2px] shadow-lg"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}