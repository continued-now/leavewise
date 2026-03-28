import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { template: '%s | Leavewise 블로그', default: '블로그 — Leavewise' },
  description: '공휴일을 활용한 연차 최적화 팁과 전략.',
  alternates: {
    canonical: '/ko/blog',
    languages: {
      en: '/blog',
      ko: '/ko/blog',
    },
    types: {
      'application/rss+xml': '/ko/blog/feed.xml',
    },
  },
};

export default function KoBlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-border bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/ko"
            className="font-display font-semibold text-ink text-lg tracking-tight hover:text-teal transition-colors"
          >
            Leavewise
          </Link>
          <Link
            href="/ko/blog"
            className="text-sm font-semibold text-ink-muted hover:text-teal transition-colors"
          >
            블로그
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
