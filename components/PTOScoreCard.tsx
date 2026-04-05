'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { trackSharePlan } from '@/lib/analytics';

export interface PTOScoreCardProps {
  year: number;
  totalLeave: number;
  totalDaysOff: number;
  windowCount: number;
  efficiency: number;
  onClose: () => void;
}

function getGrade(efficiency: number): { grade: string; label: string; color: string } {
  if (efficiency >= 3.5) return { grade: 'S', label: 'Legendary', color: '#D95740' };
  if (efficiency >= 3.0) return { grade: 'A+', label: 'Outstanding', color: '#1A6363' };
  if (efficiency >= 2.5) return { grade: 'A', label: 'Excellent', color: '#1A6363' };
  if (efficiency >= 2.0) return { grade: 'B+', label: 'Great', color: '#4A7C5E' };
  if (efficiency >= 1.8) return { grade: 'B', label: 'Good', color: '#4A7C5E' };
  if (efficiency >= 1.5) return { grade: 'C', label: 'Decent', color: '#C4872A' };
  return { grade: 'D', label: 'Room to grow', color: '#78716C' };
}

/** Draw a rounded rectangle path (polyfill for older browsers) */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getShareText(
  year: number,
  totalLeave: number,
  totalDaysOff: number,
  efficiency: number,
  grade: string
): string {
  return [
    `My ${year} PTO Score: ${grade}`,
    `${totalLeave} PTO days → ${totalDaysOff} days off (${efficiency.toFixed(1)}x efficiency)`,
    '',
    'Plan yours at leavewise.co',
  ].join('\n');
}

/** Draw the score card on canvas for image export */
function drawScoreCard(canvas: HTMLCanvasElement, props: Omit<PTOScoreCardProps, 'onClose'>) {
  const ctx = canvas.getContext('2d')!;
  const W = 600;
  const H = 400;
  canvas.width = W;
  canvas.height = H;

  const { grade, label, color } = getGrade(props.efficiency);

  // Background
  ctx.fillStyle = '#F7F6F2';
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.fill();

  // Clip to rounded rect
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.clip();

  // Border
  ctx.strokeStyle = '#E5E2DA';
  ctx.lineWidth = 2;
  roundRect(ctx, 1, 1, W - 2, H - 2, 24);
  ctx.stroke();

  // Top section — grade circle
  const cx = W / 2;
  const cy = 120;
  const r = 70;

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner fill
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Grade letter
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${grade.length > 1 ? 48 : 56}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(grade, cx, cy - 4);

  // Label under grade
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(label, cx, cy + 30);

  // Title
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`My ${props.year} PTO Score`, cx, 220);

  // Stats row
  const statsY = 264;
  const cols = [
    { value: `${props.totalLeave}`, sub: 'PTO used' },
    { value: `${props.totalDaysOff}`, sub: 'days off' },
    { value: `${props.efficiency.toFixed(1)}x`, sub: 'efficiency' },
    { value: `${props.windowCount}`, sub: 'trips' },
  ];
  const colW = W / cols.length;

  for (let i = 0; i < cols.length; i++) {
    const colCx = colW * i + colW / 2;

    ctx.fillStyle = color;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(cols[i].value, colCx, statsY);

    ctx.fillStyle = '#78716C';
    ctx.font = '500 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(cols[i].sub, colCx, statsY + 22);

    // Separator
    if (i < cols.length - 1) {
      ctx.beginPath();
      ctx.moveTo(colW * (i + 1), statsY - 18);
      ctx.lineTo(colW * (i + 1), statsY + 28);
      ctx.strokeStyle = '#E5E2DA';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Big stat line
  ctx.fillStyle = '#44403C';
  ctx.font = '500 15px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `${props.totalLeave} PTO days → ${props.totalDaysOff} days off`,
    cx,
    330
  );

  // Footer
  ctx.fillStyle = '#A8A29E';
  ctx.font = '500 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Planned with leavewise.co', cx, H - 24);
}

export function PTOScoreCard({ year, totalLeave, totalDaysOff, windowCount, efficiency, onClose }: PTOScoreCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { grade, label, color } = getGrade(efficiency);

  useEffect(() => {
    if (canvasRef.current) {
      drawScoreCard(canvasRef.current, { year, totalLeave, totalDaysOff, windowCount, efficiency });
    }
  }, [year, totalLeave, totalDaysOff, windowCount, efficiency]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    drawScoreCard(canvasRef.current, { year, totalLeave, totalDaysOff, windowCount, efficiency });
    const link = document.createElement('a');
    link.download = `pto-score-${year}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    trackSharePlan();
    toast('Score card downloaded');
  }, [year, totalLeave, totalDaysOff, windowCount, efficiency, toast]);

  const handleCopyText = useCallback(() => {
    const text = getShareText(year, totalLeave, totalDaysOff, efficiency, grade);
    navigator.clipboard.writeText(text).then(() => {
      trackSharePlan();
      toast('Score copied to clipboard');
    }).catch(() => {
      toast('Could not copy to clipboard', 'info');
    });
  }, [year, totalLeave, totalDaysOff, efficiency, grade, toast]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors p-1"
          aria-label="Close score card"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Visual preview */}
        <div className="bg-cream rounded-xl border border-border p-6 text-center space-y-4">
          {/* Grade circle */}
          <div className="inline-flex items-center justify-center">
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <span className="text-white font-display font-bold text-4xl leading-none">
                {grade}
              </span>
              <span className="text-white/80 text-[10px] font-semibold mt-1">
                {label}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="text-lg font-display font-semibold text-ink">
            My {year} PTO Score
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: totalLeave, sub: 'PTO used' },
              { value: totalDaysOff, sub: 'days off' },
              { value: `${efficiency.toFixed(1)}x`, sub: 'efficiency' },
              { value: windowCount, sub: 'trips' },
            ].map((s) => (
              <div key={s.sub}>
                <div className="text-xl font-display font-semibold" style={{ color }}>
                  {s.value}
                </div>
                <div className="text-[9px] text-ink-muted font-semibold">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Arrow line */}
          <div className="text-sm text-ink-soft font-medium">
            {totalLeave} PTO days &rarr; {totalDaysOff} days off
          </div>

          <div className="text-[11px] text-ink-muted">
            Planned with leavewise.co
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download image
          </button>
          <button
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-ink text-sm font-semibold hover:border-teal/40 hover:text-teal transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy text
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
