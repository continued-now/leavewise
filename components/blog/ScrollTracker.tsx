'use client';

import { useEffect, useRef } from 'react';
import { trackBlogScrollDepth } from '@/lib/analytics';

const MILESTONES = [25, 50, 75, 100];

/**
 * Renders invisible sentinel divs at 25/50/75/100% of the parent article height
 * and fires a GA4 event when each one becomes visible.
 */
export function ScrollTracker() {
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const sentinels = MILESTONES.map((pct) => {
      const el = document.getElementById(`scroll-sentinel-${pct}`);
      return el;
    }).filter(Boolean) as HTMLElement[];

    if (sentinels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const depth = Number(entry.target.getAttribute('data-depth'));
          if (!depth || firedRef.current.has(depth)) continue;
          firedRef.current.add(depth);
          trackBlogScrollDepth(depth);
        }
      },
      { threshold: 0.1 }
    );

    for (const el of sentinels) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {MILESTONES.map((pct) => (
        <div
          key={pct}
          id={`scroll-sentinel-${pct}`}
          data-depth={pct}
          aria-hidden="true"
          style={{ position: 'absolute', top: `${pct}%`, left: 0, width: '1px', height: '1px', pointerEvents: 'none' }}
        />
      ))}
    </>
  );
}
