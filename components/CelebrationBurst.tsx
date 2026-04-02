'use client';

import { useEffect, useState } from 'react';

interface CelebrationBurstProps {
  /** Show the burst when this becomes true */
  trigger: boolean;
  /** Efficiency threshold to qualify for celebration */
  efficiency: number;
}

const PARTICLES = 24;
const COLORS = ['#D95740', '#1A6363', '#4A7C5E', '#C4872A', '#E8F3F3', '#FEF0ED'];

/**
 * CSS-only confetti burst that triggers on high-efficiency optimization.
 * Auto-removes after animation completes. Respects prefers-reduced-motion.
 */
export function CelebrationBurst({ trigger, efficiency }: CelebrationBurstProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger && efficiency >= 2.5) {
      // Check reduced motion
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, efficiency]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden animate-celebration" aria-hidden="true">
      {Array.from({ length: PARTICLES }).map((_, i) => {
        const angle = (360 / PARTICLES) * i;
        const distance = 80 + Math.random() * 160;
        const size = 4 + Math.random() * 6;
        const color = COLORS[i % COLORS.length];
        const duration = 0.8 + Math.random() * 0.6;
        const delay = Math.random() * 0.2;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              backgroundColor: color,
              opacity: 0,
              animation: `confetti-burst ${duration}s ${delay}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              // CSS custom properties for the animation
              '--angle': `${angle}deg`,
              '--distance': `${distance}px`,
            } as React.CSSProperties}
          />
        );
      })}

      <style>{`
        @keyframes confetti-burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(0deg) translate(0, 0) scale(1);
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translate(var(--distance), 0) scale(0.3);
          }
        }
      `}</style>
    </div>
  );
}
