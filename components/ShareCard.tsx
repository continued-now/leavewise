'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { trackSharePlan, trackKakaoShare } from '@/lib/analytics';

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (params: {
          objectType: string;
          content: { title: string; description: string; imageUrl: string; link: { mobileWebUrl: string; webUrl: string } };
        }) => void;
      };
    };
  }
}

async function loadKakaoSDK(): Promise<void> {
  if (window.Kakao?.isInitialized()) return;
  // Load the script if not already present
  if (!window.Kakao) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Kakao SDK'));
      document.head.appendChild(s);
    });
  }
  const key = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
  if (key && window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(key);
  }
}

export interface ShareCardProps {
  year: number;
  totalLeave: number;
  totalDaysOff: number;
  windows: {
    label: string;
    totalDays: number;
    ptoDaysUsed: number;
    startStr: string;
    endStr: string;
  }[];
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Draw a rounded rectangle path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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

function drawShareCard(
  canvas: HTMLCanvasElement,
  props: ShareCardProps
) {
  const ctx = canvas.getContext('2d')!;
  const W = 800;
  // Dynamic height based on number of windows
  const headerHeight = 240;
  const windowRowHeight = 64;
  const footerHeight = 80;
  const H = headerHeight + props.windows.length * windowRowHeight + footerHeight;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.fill();

  // Clip to rounded rect
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.clip();

  // Subtle border
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 2;
  roundRect(ctx, 1, 1, W - 2, H - 2, 24);
  ctx.stroke();

  // Title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillText(`My ${props.year} PTO Plan`, 48, 64);

  // Big stat line
  ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0d9488';
  ctx.fillText(
    `${props.totalLeave} days \u2192 ${props.totalDaysOff} days off`,
    48,
    136
  );

  // Multiplier
  const multiplier = props.totalLeave > 0
    ? (props.totalDaysOff / props.totalLeave).toFixed(1)
    : '0.0';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0d9488';
  ctx.fillText(`${multiplier}x multiplier`, 48, 180);

  // Divider
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, 204);
  ctx.lineTo(W - 48, 204);
  ctx.stroke();

  // Window rows
  const sortedWindows = [...props.windows].sort((a, b) =>
    a.startStr.localeCompare(b.startStr)
  );

  let y = headerHeight;
  for (const w of sortedWindows) {
    const dateRange = `${formatDate(w.startStr)} \u2013 ${formatDate(w.endStr)}`;

    // Date range
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(dateRange, 48, y);

    // Days off + PTO cost
    ctx.fillStyle = '#666666';
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `${w.totalDays} days off \u00b7 ${w.ptoDaysUsed} PTO used`,
      48,
      y + 30
    );

    // Label on the right
    ctx.fillStyle = '#999999';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    const labelWidth = ctx.measureText(w.label).width;
    ctx.fillText(w.label, W - 48 - labelWidth, y);

    y += windowRowHeight;
  }

  // Footer divider
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, H - footerHeight + 10);
  ctx.lineTo(W - 48, H - footerHeight + 10);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = '#999999';
  ctx.font = '20px system-ui, -apple-system, sans-serif';
  ctx.fillText('Planned with leavewise.co', 48, H - 32);
}

export function ShareCard(props: ShareCardProps) {
  const { year, totalLeave, totalDaysOff, windows, onClose } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [kakaoLoading, setKakaoLoading] = useState(false);

  const multiplier = totalLeave > 0
    ? (totalDaysOff / totalLeave).toFixed(1)
    : '0.0';

  const sortedWindows = [...windows].sort((a, b) =>
    a.startStr.localeCompare(b.startStr)
  );

  // Draw canvas on mount / prop change
  useEffect(() => {
    if (canvasRef.current) {
      drawShareCard(canvasRef.current, props);
    }
  }, [props]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    // Re-draw to ensure canvas is fresh
    drawShareCard(canvasRef.current, props);
    const link = document.createElement('a');
    link.download = `pto-plan-${year}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    trackSharePlan();
    toast('Image downloaded');
  }, [props, year, toast]);

  const handleCopyText = useCallback(() => {
    const lines: string[] = [
      `My ${year} PTO Plan`,
      `${totalLeave} days \u2192 ${totalDaysOff} days off (${multiplier}x multiplier)`,
      '',
    ];
    for (const w of sortedWindows) {
      lines.push(
        `${formatDate(w.startStr)} \u2013 ${formatDate(w.endStr)}: ${w.totalDays} days off, ${w.ptoDaysUsed} PTO`
      );
    }
    lines.push('', 'Planned with leavewise.co');
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      trackSharePlan();
      toast('Summary copied to clipboard');
    });
  }, [year, totalLeave, totalDaysOff, multiplier, sortedWindows, toast]);

  const handleKakaoShare = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      setKakaoLoading(true);
      await loadKakaoSDK();
      if (!window.Kakao?.isInitialized()) return;
      const imageUrl = canvasRef.current.toDataURL('image/png');
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `내 ${year}년 연차 플랜`,
          description: `${totalLeave}일 연차 → ${totalDaysOff}일 휴가 (${multiplier}x)`,
          imageUrl,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      });
      trackKakaoShare();
    } catch {
      toast('Failed to load KakaoTalk sharing');
    } finally {
      setKakaoLoading(false);
    }
  }, [year, totalLeave, totalDaysOff, multiplier, toast]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors p-1"
          aria-label="Close share card"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6l8 8M14 6l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Card preview */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            padding: '28px 32px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '12px',
            }}
          >
            My {year} PTO Plan
          </div>

          {/* Big stat */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#0d9488',
              marginBottom: '6px',
            }}
          >
            {totalLeave} days &rarr; {totalDaysOff} days off
          </div>

          {/* Multiplier */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#0d9488',
              marginBottom: '16px',
            }}
          >
            {multiplier}x multiplier
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: '#e5e5e5',
              marginBottom: '16px',
            }}
          />

          {/* Window rows */}
          {sortedWindows.map((w, i) => (
            <div
              key={i}
              style={{
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  {formatDate(w.startStr)} &ndash; {formatDate(w.endStr)}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666666',
                    marginTop: '2px',
                  }}
                >
                  {w.totalDays} days off &middot; {w.ptoDaysUsed} PTO used
                </div>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#999999',
                  flexShrink: 0,
                  marginLeft: '12px',
                  marginTop: '2px',
                }}
              >
                {w.label}
              </div>
            </div>
          ))}

          {/* Footer divider */}
          <div
            style={{
              height: '1px',
              background: '#e5e5e5',
              marginTop: '8px',
              marginBottom: '12px',
            }}
          />

          {/* Footer */}
          <div
            style={{
              fontSize: '12px',
              color: '#999999',
            }}
          >
            Planned with leavewise.co
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
        {process.env.NEXT_PUBLIC_KAKAO_APP_KEY && (
          <button
            onClick={handleKakaoShare}
            disabled={kakaoLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEE500] text-[#391B1B] text-sm font-semibold hover:bg-[#F0D800] transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.582 2 11c0 2.913 1.73 5.478 4.334 6.979l-.997 3.73a.307.307 0 00.455.338l4.372-2.916c.6.084 1.214.127 1.836.127 5.523 0 10-3.582 10-8s-4.477-8-10-8z"/>
            </svg>
            {kakaoLoading ? '로딩 중...' : '카카오톡으로 공유'}
          </button>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-hover transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download image
          </button>
          <button
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-ink text-sm font-semibold hover:border-teal/40 hover:text-teal transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy text summary
          </button>
        </div>
        </div>

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
