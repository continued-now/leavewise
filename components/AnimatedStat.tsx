'use client';

import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface AnimatedStatProps {
  value: number;
  className?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function AnimatedStat({
  value,
  className = '',
  suffix = '',
  decimals = 0,
  duration = 600,
}: AnimatedStatProps) {
  const display = useAnimatedNumber(value, duration, decimals);

  return (
    <span className={className}>
      {decimals > 0 ? display.toFixed(decimals) : display}
      {suffix}
    </span>
  );
}
