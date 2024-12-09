"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

function Header() {
  const pathname = usePathname();
  const [active, setActive] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const routeToActiveMap = {
      "/": "Home",
      "/about": "About",
      "/work": "Work",
      "/services": "Services",
      "/inquire": "Inquire",
    };
    setActive(routeToActiveMap[pathname] || "Home");
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

  return (
    <div className="border-b border-[#575553] relative">
      <nav
        className={`flex items-center justify-between px-12 py-1 md:py-2 relative z-20 ${
          isDevelopment ? "bg-[#6C92F0]" : ""
        }`}
      >
        {/* Logo */}
        <div className="flex flex-row left-0 md:pl-5">
          <Link href="/" passHref>
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="cursor-pointer"
            />
          </Link>

          <p
            className={`text-[10px] md:text-xs ${
              isDevelopment ? "text-white" : "text-[#575553]"
            } ml-2 mt-20`}
          >
            Made by{" "}
            <Link
              href="https://niketchawla.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${
                isDevelopment ? "text-white" : "text-[#575553]"
              } underline`}
            >
              Niket Chawla
            </Link>
          </p>
        </div>

        {/* Menu Items (Desktop View) */}
        <div className="hidden md:flex pr-12">
          <ul className="relative flex space-x-16 items-center">
            {["Home", "About", "Work", "Services", "Inquire"].map((item) => (
              <li
                key={item}
                className={`relative cursor-pointer ${
                  isDevelopment ? "text-white" : "text-[#575553]"
                } text-md font-medium`}
              >
                <Link
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  passHref
                  onClick={() => setActive(item)}
                >
                  {item}
                </Link>

                {/* Animated Underline */}
                {active === item && (
                  <motion.div
                    layoutId="underline"
                    className={`absolute bottom-0 left-0 ${
                      isDevelopment ? "bg-white" : "bg-[#575553]"
                    }`}
                    style={{ height: "2px", width: "100%" }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    exit={{ width: "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </li>
            ))}

            {/* Admin Panel Button (Visible in Development Only) */}
            {isDevelopment && (
              <li>
                <Link
                  href="/admin-panel69"
                  className="px-4 py-1 bg-[#ff8c00] text-white rounded-md hover:bg-[#ff9d33] transition"
                >
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Development Mode Text */}
        {isDevelopment && (
          <div className="absolute left-1/4 transform -translate-x-1/2 text-white font-semibold">
            Development Mode ⌨
          </div>
        )}

        {/* Hamburger Icon (Mobile View) */}
        <div className="md:hidden pr-5 relative z-50">
          <FaBars
            className="text-[#575553] text-2xl cursor-pointer"
            onClick={handleMenuToggle}
          />
        </div>
      </nav>

      {/* Dark Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleMenuToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Menu (Mobile View) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 w-3/4 h-full bg-[rgb(250,244,237)] shadow-lg md:hidden z-40"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <FaTimes
                className="text-[#575553] text-2xl cursor-pointer"
                onClick={handleMenuToggle}
              />
            </div>

            <div className="p-5">
              <div>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                />
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
