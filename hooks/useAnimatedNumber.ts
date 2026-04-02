'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from its previous value to the target value.
 * Uses ease-out cubic for a satisfying deceleration feel.
 */
export function useAnimatedNumber(
  target: number,
  duration = 600,
  decimals = 0
): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    prevRef.current = target;

    if (from === to) {
      setDisplay(to);
      return;
    }

    // Respect reduced motion preference
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplay(to);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      if (decimals > 0) {
        setDisplay(parseFloat(current.toFixed(decimals)));
      } else {
        setDisplay(Math.round(current));
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, decimals]);

  return display;
}
