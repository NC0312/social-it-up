'use client';
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu } from 'lucide-react';
import { useAdminAuth } from "../providers/AdminAuthProvider";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from "sonner";
import { LogOut, Settings } from 'lucide-react';

const REVIEW_PANEL_ROUTE = "/review-panel69";
const BUG_PANEL_ROUTE = "/bug-panel69";

function Header() {
  const { admin: currentAdmin, isAuthenticated, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("Home");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [approvedAdmins, setApprovedAdmins] = useState([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const routeToActiveMap = {
      "/": "Home",
      "/about": "About",
      "/work": "Work",
      "/services": "Services",
      "/inquire": "Inquire",
      "/login": "Login",
    };
    setActive(routeToActiveMap[pathname] || "Home");
  }, [pathname]);

  // Set up notification listener
  useEffect(() => {
    if (!currentAdmin?.id) return;

    // Set up real-time listener for notifications
    // Since we now delete them instead of marking as read, we don't need to filter by read status
    const q = query(
      collection(db, 'notifications'),
      where('adminId', '==', currentAdmin.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotifications(snapshot.docs.length);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      setUnreadNotifications(0);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [currentAdmin]);

  const adminLinks = [
    { href: '/admin-panel69', label: 'Admin Panel' },
    { href: '/bug-panel69', label: 'Bugs & Issues' },
    { href: '/rating-dashboard69', label: 'Rating Dashboard' },
    { href: '/admin-management69', label: 'Admin Management' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add outside click handler for profile dropdown
  useEffect(() => {
    const handleProfileClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleProfileClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleProfileClickOutside);
    };
  }, []);

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

  // Fetch admins on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdmins();
    }
  }, [isAuthenticated, loading]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);

      // Fetch approved admins
      const approvedQuery = query(
        collection(db, "admins"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc")
      );
      const approvedSnapshot = await getDocs(approvedQuery);
      const approvedList = approvedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));

      setApprovedAdmins(approvedList);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 2 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };


  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDesktopLogout = async (e) => {
    e.preventDefault();
    try {
      // Always await the async logout function
      await logout();
      // The redirect is handled inside the logout function
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMobileLogout = async (e) => {
    e.preventDefault();
    try {
      // Always await the async logout function
      await logout();
      // Close the mobile menu after successful logout
      handleMenuToggle();
      // The redirect is handled inside the logout function
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

  // Get admin's first letter from name
  const getAdminInitial = () => {
    if (!currentAdmin) return 'A';
    if (currentAdmin.firstName && currentAdmin.firstName.length > 0) {
      return currentAdmin.firstName.charAt(0).toUpperCase();
    }
    if (currentAdmin.username && currentAdmin.username.length > 0) {
      return currentAdmin.username.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <div className="border-b border-[#575553] relative">
      <nav
        className={`flex items-center justify-between px-12 py-1 md:py-2 relative z-20 ${pathname === REVIEW_PANEL_ROUTE
          ? "bg-green-600"
          : pathname === BUG_PANEL_ROUTE
            ? "bg-red-600"
            : process.env.NEXT_PUBLIC_ENV === "development"
              ? "bg-[#808D7C]"
              : ""
          }`}
      >
        {/* Logo */}
        <div className="flex flex-row left-0 md:pl-5" style={{ userSelect: "none" }}>
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
            className={`text-[10px] md:text-xs ${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
              ? "text-white"
              : "text-[#575553]"
              } ml-2 mt-20`}
          >
            Version by{" "}
            <Link
              href="https://niketchawla.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
                ? "text-white"
                : "text-[#575553]"
                } underline`}
            >
              Niket Chawla
            </Link>
          </p>
        </div>

        {/* Menu Items (Desktop View) */}
        <div className="hidden md:flex pr-12" style={{ userSelect: "none" }}>
          <ul className="relative flex space-x-12 items-center">
            {["Home", "About", "Work", "Services", "Inquire"].map((item) => (
              <li
                key={item}
                className={`relative cursor-pointer ${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
                  ? "text-white"
                  : "text-[#575553]"
                  } text-md font-medium`}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  passHref
                  onClick={() => setActive(item)}
                >
                  {item}
                </Link>

                {(active === item || hoveredItem === item) && (
                  <motion.div
                    layoutId={active === item ? "activeUnderline" : "hoverUnderline"}
                    className={`absolute bottom-0 left-0 ${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
                      ? "bg-white"
                      : "bg-[#575553]"
                      }`}
                    style={{
                      height: "2px",
                      width: "100%",
                      opacity: hoveredItem === item && active !== item ? 0.6 : 1
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    exit={{ width: "0%" }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </li>
            ))}

            {/* Display admin first letter instead of user icon */}
            {(isAuthenticated && isDevelopment) ? (
              <li
                className={`relative cursor-pointer ${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
                  ? "text-white"
                  : "text-[#575553]"
                  } text-md font-medium`}
                ref={profileDropdownRef}
              >
                <div className="relative flex gap-10 items-center">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#808D7C] font-bold cursor-pointer"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    onMouseEnter={() => setHoveredItem("Profile")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {getAdminInitial()}
                  </div>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">@{currentAdmin?.username}</div>
                        <div className="text-xs text-gray-500 capitalize">{currentAdmin?.role || 'admin'}</div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#808D7C] hover:text-white transition flex items-center"
                      >
                        <Settings size={16} className="mr-2" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleDesktopLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}

                  {/* Notification Bell remains unchanged */}
                  <Link href="/notifications" className="relative group">
                    <Bell
                      size={24}
                      className="text-white hover:text-gray-200 transition-colors"
                    />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                    <span className="absolute hidden group-hover:block bg-[#36302A] text-white text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      {unreadNotifications > 0 ? `${unreadNotifications} new notifications` : 'No new notifications'}
                    </span>
                  </Link>
                </div>
              </li>
            ) : (
              // Show login only in development mode
              process.env.NEXT_PUBLIC_ENV !== "production" && (
                <li
                  className={`relative cursor-pointer ${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
                    ? "text-white"
                    : "text-[#575553]"
                    } text-md font-medium`}
                  onMouseEnter={() => setHoveredItem("Login")}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    href="/login"
                    passHref
                    onClick={() => setActive("Login")}
                  >
                    Login
                  </Link>

                  {(active === "Login" || hoveredItem === "Login") && (
                    <motion.div
                      layoutId={active === "Login" ? "activeUnderline" : "hoverUnderline"}
                      className={`absolute bottom-0 left-0 ${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
                        ? "bg-white"
                        : "bg-[#575553]"
                        }`}
                      style={{
                        height: "2px",
                        width: "100%",
                        opacity: hoveredItem === "Login" && active !== "Login" ? 0.6 : 1
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      exit={{ width: "0%" }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </li>
              )
            )}

            {/* Admin Dropdown */}
            {isDevelopment && isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 rounded-md hover:bg-[#808D7C] hover:bg-opacity-20 transition"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#808D7C] hover:text-white transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ul>
        </div>

        {/* Development Mode Text */}
        {isDevelopment && (
          <>
            {isAuthenticated ? (
              <div className="absolute left-1/4 transform -translate-x-1/2 ml-36 md:ml-0 text-white text-xs md:text-lg font-light md:font-semibold" style={{ userSelect: "none" }}>
                {getGreeting()}, {currentAdmin?.username}!👋
              </div>
            ) : (
              <div className="absolute left-1/4 transform -translate-x-1/2 ml-36 md:ml-0 text-white text-xs md:text-lg font-light md:font-semibold" style={{ userSelect: "none" }}>
                {getGreeting()}👋
              </div>
            )}
          </>
        )}

        {/* Mobile view components remain the same */}
        <div className="md:hidden pr-5 relative z-50" style={{ userSelect: "none" }}>
          <FaBars
            className={`${isDevelopment || pathname === REVIEW_PANEL_ROUTE || pathname === BUG_PANEL_ROUTE
              ? "text-white"
              : "text-[#575553]"
              } text-2xl cursor-pointer`}
            onClick={handleMenuToggle}
          />
        </div>
      </nav>

      {/* Mobile menu components remain the same */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleMenuToggle}
            style={{ userSelect: "none" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 w-3/4 h-full bg-[rgb(250,244,237)] shadow-lg md:hidden z-40"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ userSelect: "none" }}
          >
            <div className="absolute top-4 right-4" style={{ userSelect: "none" }}>
              <FaTimes
                className="text-[#575553] text-2xl cursor-pointer"
                onClick={handleMenuToggle}
              />
            </div>

            <div className="p-5" style={{ userSelect: "none" }}>
              <div>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </div>
            </div>

            <ul className="flex flex-col items-center space-y-6 pt-10" style={{ userSelect: "none" }}>
              {["Home", "About", "Work", "Services", "Inquire"].map((item) => (
                <li
                  key={item}
                  className={`cursor-pointer text-[#575553] text-lg font-medium pb-0.25 ${active === item ? "border-b border-[#575553]" : ""
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

              {/* User menu for Mobile Menu */}
              {isAuthenticated ? (
                <>
                  <li className="pt-4">
                    <Link
                      href="/notifications"
                      className="px-4 py-2 bg-[#36302A] text-white rounded-md hover:bg-[#514840] transition flex items-center justify-center relative"
                      onClick={handleMenuToggle}
                    >
                      <Bell size={16} className="mr-2" />
                      Notifications
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadNotifications > 99 ? '99+' : unreadNotifications}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li className="pt-4">
                    <Link
                      href="/profile"
                      className="px-4 py-2 bg-[#36302A] text-white rounded-md hover:bg-opacity-90 transition flex items-center justify-center"
                      onClick={handleMenuToggle}
                    >
                      <Settings size={16} className="mr-2" />
                      Profile Settings
                    </Link>
                  </li>
                  <li className="pt-4">
                    <button
                      onClick={handleMobileLogout}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center justify-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li
                  className={`cursor-pointer text-[#575553] text-lg font-medium pb-0.25 ${active === "Login" ? "border-b border-[#575553]" : ""
                    }`}
                >
                  <Link
                    href="/login"
                    passHref
                    onClick={() => {
                      setActive("Login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </Link>
                </li>
              )}

              {isDevelopment && (
                <li className="pt-6">
                  <Link
                    href="/admin-panel69"
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#808D7C] transition"
                    onClick={handleMenuToggle}
                  >
                    Admin Panel
                  </Link>
                </li>
              )}
              {isDevelopment && (
                <li className="pt-4">
                  <Link
                    href="/bug-panel69"
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#808D7C]  transition"
                    onClick={handleMenuToggle}
                  >
                    Bugs & Issues
                  </Link>
                </li>
              )}
              {isDevelopment && (
                <li className="pt-4">
                  <Link
                    href="/rating-dashboard69"
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#808D7C]  transition"
                    onClick={handleMenuToggle}
                  >
                    Rating Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Header;