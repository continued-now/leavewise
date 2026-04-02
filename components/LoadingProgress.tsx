'use client';

import { useEffect, useState } from 'react';

interface LoadingProgressProps {
  total: number;
  loaded: number;
  label?: string;
}

export function LoadingProgress({ total, loaded, label = 'Loading flight deals' }: LoadingProgressProps) {
  const [visible, setVisible] = useState(true);
  const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
  const done = loaded >= total;

  // Auto-hide after all loaded with a brief delay for the bar to reach 100%
  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    } else {
      setVisible(true);
    }
  }, [done]);

  if (!visible || total === 0) return null;

  return (
    <div className="flex items-center gap-3 px-1 py-1">
      <div className="flex-1 max-w-[200px] h-1.5 bg-border/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-ink-muted font-medium whitespace-nowrap">
        {label}... {loaded}/{total} windows
      </span>
    </div>
  );
}
