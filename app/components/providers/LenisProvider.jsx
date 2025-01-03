"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "@studio-freight/lenis";

const LenisContext = createContext({});

export const useLenis = () => {
  return useContext(LenisContext);
};

export const LenisProvider = ({ children, options = {} }) => {
  const lenisRef = useRef();
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      ...options,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });

    resizeObserver.observe(document.body);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      resizeObserver.disconnect();
    };
  }, [options]);

  // Reset scroll position on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
};
