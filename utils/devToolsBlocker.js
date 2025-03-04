'use client';
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/components/providers/AdminAuthProvider"; // Adjust the import path as needed

export const DevToolsBlocker = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const adminAuth = useAdminAuth();

  useEffect(() => {
    // Check if we're in production mode
    const isProduction = process.env.NEXT_PUBLIC_DEV_FLAG === "Y";

    // If we're in development mode (ENV=y), don't apply the blocker
    if (!isProduction) return;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        // Just log the user out when dev tools are detected
        if (adminAuth && typeof adminAuth.logout === 'function') {
          adminAuth.logout();
        }
      }
    };

    const preventShortcuts = (e) => {
      // Prevent keyboard shortcuts that open dev tools
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        // Log user out on F12
        if (adminAuth && typeof adminAuth.logout === 'function') {
          adminAuth.logout();
        }
      }

      if (
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        // Log user out on these shortcuts
        if (adminAuth && typeof adminAuth.logout === 'function') {
          adminAuth.logout();
        }
      }
    };

    window.addEventListener("resize", checkDevTools);
    window.addEventListener("keydown", preventShortcuts);

    // Run an initial check
    checkDevTools();

    return () => {
      window.removeEventListener("resize", checkDevTools);
      window.removeEventListener("keydown", preventShortcuts);
    };
  }, [adminAuth]);

  // No UI is returned - we just want to perform the logout action
  return null;
}