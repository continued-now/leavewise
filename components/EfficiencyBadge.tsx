'use client';

import { useEffect, useState } from 'react';

interface EfficiencyBadgeProps {
  efficiency: number;
  country: string;
}

export function EfficiencyBadge({ efficiency, country }: EfficiencyBadgeProps) {
  const [percentile, setPercentile] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!efficiency || !country) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch('/api/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ efficiency, country, ptoDays: 0 }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPercentile(data.percentile);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [efficiency, country]);

  // Error: show nothing
  if (error) return null;

  // Loading: small skeleton
  if (loading) {
    return (
      <>
        <div className="w-px h-3 bg-border shrink-0" />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-block w-12 h-4 bg-border/40 rounded animate-pulse" />
        </div>
      </>
    );
  }

  // No data
  if (percentile === null) return null;

  const topPct = 100 - percentile;
  const display = topPct <= 0 ? 1 : topPct;

  // Color: teal if top 30%, sage if top 50%, ink-muted otherwise
  let colorClass: string;
  if (display <= 30) {
    colorClass = 'text-teal bg-teal/10 border-teal/20';
  } else if (display <= 50) {
    colorClass = 'text-sage bg-sage/10 border-sage/20';
  } else {
    colorClass = 'text-ink-muted bg-border/30 border-border';
  }

  return (
    <>
      <div className="w-px h-3 bg-border shrink-0" />
      <span
        className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${colorClass}`}
      >
        Top {display}%
      </span>
    </>
  );
}
