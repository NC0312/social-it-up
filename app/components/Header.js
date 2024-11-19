"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation"; // Import usePathname for route synchronization

function Header() {
  const pathname = usePathname(); // Get the current route
  const [active, setActive] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Map the current pathname to the active menu item
    const routeToActiveMap = {
      "/": "Home",
      "/about": "About",
      "/work": "Work",
      "/services": "Services",
      "/inquire": "Inquire",
    };
    setActive(routeToActiveMap[pathname] || "Home");
  }, [pathname]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="border-b border-[#575553]">
      <nav className="flex items-center justify-between px-12 py-3">
        {/* Logo */}
        <div className="pl-5">
          <Link href="/" passHref>
            <Image
              src="/logo.png" // Replace with your logo path
              alt="Logo"
              width={120}
              height={120}
              className="cursor-pointer"
            />
          </Link>
        </div>

        {/* Menu Items (Desktop View) */}
        <div className="hidden md:flex pr-12">
          <ul className="flex space-x-16">
            {["Home", "About", "Work", "Services", "Inquire"].map((item) => (
              <li
                key={item}
                className={`cursor-pointer text-[#575553] text-md font-medium pb-0.25 ${
                  active === item ? "border-b border-[#575553]" : ""
                }`}
              >
                <Link
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  passHref
                  onClick={() => setActive(item)}
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
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between p-5">
              <div>
                <Image
                  src="/logo.png"
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
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    passHref
                    onClick={() => {
                      setActive(item);
                      setIsMenuOpen(false);
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
