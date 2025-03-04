'use client';
import { useEffect } from "react";
import { useAdminAuth } from "@/app/components/providers/AdminAuthProvider";
import devtools from 'devtools-detect';

export const DevToolsBlocker = () => {
  const adminAuth = useAdminAuth();

  useEffect(() => {
    // Check if we're in production mode
    const isProduction = process.env.NEXT_PUBLIC_DEV_FLAG === "Y";

    // If we're in development mode (ENV=y), don't apply the blocker
    if (!isProduction) return;

    // Function from the image - timing-based detection
    function isDevToolsOpenTiming() {
      const start = new Date().getTime();
      debugger;
      const end = new Date().getTime();
      return end - start > 100;
    }

    // Function that checks and takes action using multiple detection methods
    function checkDevTools() {
      // First check using the devtools-detect library
      if (devtools.isOpen) {
        handleDevToolsOpen();
        return;
      }

      // Fallback to timing method
      if (isDevToolsOpenTiming()) {
        handleDevToolsOpen();
        return;
      }

      // DevTools not detected, ensure elements are visible
      document.querySelectorAll('.modifyViaDevTools').forEach(el => {
        el.style.display = '';
      });
    }

    // Handle when devtools is open
    function handleDevToolsOpen() {
      // Log the user out when dev tools are detected
      if (adminAuth && typeof adminAuth.logout === 'function') {
        adminAuth.logout();
      }

      // Hide elements with class 'modifyViaDevTools' as in the image
      document.querySelectorAll('.modifyViaDevTools').forEach(el => {
        el.style.display = 'none';
      });
    }

    // Additional dimension-based detection
    const dimensionCheck = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        handleDevToolsOpen();
      }
    };

    // Prevent keyboard shortcuts
    const preventShortcuts = (e) => {
      // Prevent keyboard shortcuts that open dev tools
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        handleDevToolsOpen();
      }

      if (
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        handleDevToolsOpen();
      }
    };

    // Set up event listener for devtools-detect
    const handleDevtoolsChange = (e) => {
      if (e.detail.isOpen) {
        handleDevToolsOpen();
      }
    };

    window.addEventListener('devtoolschange', handleDevtoolsChange);

    // Initial check when the window loads (as in the image)
    checkDevTools();

    // Set up event listeners
    window.addEventListener("resize", dimensionCheck);
    window.addEventListener("keydown", preventShortcuts);

    // Periodically check if DevTools is opened (as in the image)
    const interval = setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener('devtoolschange', handleDevtoolsChange);
      window.removeEventListener("resize", dimensionCheck);
      window.removeEventListener("keydown", preventShortcuts);
      clearInterval(interval);
    };
  }, [adminAuth]);

  // No UI is returned - we just want to perform the logout action
  return null;
}