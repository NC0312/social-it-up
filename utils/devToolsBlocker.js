'use client';
import { useEffect, useState } from "react";

export const DevToolsBlocker = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // if (process.env.NEXT_PUBLIC_ENV !== "production") return;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    const detectDebugger = () => {
      const startTime = performance.now();
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        setIsDevToolsOpen(true);
      }
    };

    const preventShortcuts = (e) => {
      if (e.key === "F12" || e.keyCode === 123) e.preventDefault();
      if (
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("resize", checkDevTools);
    window.addEventListener("keydown", preventShortcuts);
    setInterval(detectDebugger, 1000); 

    return () => {
      window.removeEventListener("resize", checkDevTools);
      window.removeEventListener("keydown", preventShortcuts);
    };
  }, []);

  return isDevToolsOpen ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <h1>🚨 Developer tools are not allowed! 🚨</h1>
      <p>Please close developer tools to continue using this website.</p>
    </div>
  ) : null;
};
