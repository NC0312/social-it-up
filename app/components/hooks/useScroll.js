// hooks/useScroll.js
"use client"
import { useEffect } from 'react';
import { useLenis } from '../providers/LenisProvider';

export const useScroll = ({
  onScroll,
  onStop,
  onStart,
  onChange,
  includeDirection = false,
} = {}) => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Scroll handlers
    const scrollHandler = ({ direction, velocity, progress }) => {
      onScroll?.({
        scroll: lenis.scroll,
        limit: lenis.limit,
        velocity,
        progress,
        direction: includeDirection ? direction : undefined,
      });
    };

    // Stop handler
    const stopHandler = () => {
      onStop?.();
    };

    // Start handler
    const startHandler = () => {
      onStart?.();
    };

    // Change handler for scroll position changes
    const changeHandler = () => {
      onChange?.({
        scroll: lenis.scroll,
        limit: lenis.limit,
        progress: lenis.progress,
      });
    };

    // Add event listeners
    if (onScroll) lenis.on('scroll', scrollHandler);
    if (onStop) lenis.on('stop', stopHandler);
    if (onStart) lenis.on('start', startHandler);
    if (onChange) lenis.on('scroll', changeHandler);

    // Cleanup
    return () => {
      if (onScroll) lenis.off('scroll', scrollHandler);
      if (onStop) lenis.off('stop', stopHandler);
      if (onStart) lenis.off('start', startHandler);
      if (onChange) lenis.off('scroll', changeHandler);
    };
  }, [lenis, onScroll, onStop, onStart, onChange, includeDirection]);

  return lenis;
};