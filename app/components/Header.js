"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link"; // Import Next.js Link component
import { motion } from "framer-motion"; // Import Framer Motion
import { AnimatePresence } from "framer-motion";

function Header() {
  const [active, setActive] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="border-b border-[#575553]">
      <nav className="flex items-center justify-between px-12 py-3">
        {/* Logo */}
        <div className="pl-5">
          <Image
            src="/logo.png" // Replace with your logo path
            alt="Logo"
            width={120} // Adjust size if needed
            height={120}
          />
        </div>

        {/* Menu Items (Desktop View) */}
        <div className="hidden md:flex pr-12">
          <ul className="flex space-x-16">
            {["Home", "About", "Work", "Services", "Inquire"].map((item) => (
              <li
                key={item}
                className={`cursor-pointer text-[#575553] text-sm font-medium pb-0.25 ${
                  active === item ? "border-b border-[#575553]" : ""
                }`}
              >
                <Link
                  href={`/${item.toLowerCase()}`} // Navigate to respective route
                  passHref
                  onClick={() => setActive(item)} // Set active menu item
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hamburger Icon (Mobile View) */}
        <div className="md:hidden pr-5" onClick={handleMenuToggle}>
          <FaBars className="text-[#575553] text-2xl" />
        </div>
      </nav>

        {/* Sidebar Menu (Mobile View) */}
        <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 w-3/4 h-full bg-[rgb(250,244,237)] shadow-lg md:hidden"
            initial={{ x: "-100%" }} // Sidebar starts off-screen
            animate={{ x: 0 }} // Sidebar moves to its normal position
            exit={{ x: "-100%" }} // Sidebar moves off-screen again when closed
            transition={{ type: "spring", stiffness: 300, damping: 30 }} // Animation properties
          >
            <div className="flex justify-between p-5">
              <div>
                <Image
                  src="/logo.png" // Replace with your logo path
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </div>
              <div onClick={handleMenuToggle}>
                <FaTimes className="text-[#575553] text-2xl cursor-pointer" />
              </div>
            </div>

            <ul className="flex flex-col items-center space-y-6 pt-10">
              {["Home", "About", "Work", "Services", "Inquire"].map((item) => (
                <li
                  key={item}
                  className={`cursor-pointer text-[#575553] text-lg font-medium pb-0.25 ${
                    active === item ? "border-b border-[#575553]" : ""
                  }`}
                >
                  <Link
                    href={`/${item.toLowerCase()}`} // Navigate to respective route
                    passHref
                    onClick={() => {
                      setActive(item);
                      setIsMenuOpen(false); // Close the menu when an item is clicked
                    }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Header;
