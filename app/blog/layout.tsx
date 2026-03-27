import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { template: '%s | Leavewise Blog', default: 'Blog — Leavewise' },
  description: 'Tips and strategies for maximizing your paid time off around public holidays.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-border bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-semibold text-ink text-lg tracking-tight hover:text-teal transition-colors"
          >
            Leavewise
          </Link>
          <Link
            href="/blog"
            className="text-sm font-semibold text-ink-muted hover:text-teal transition-colors"
          >
            Blog
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
