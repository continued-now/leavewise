'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Heading } from '@/lib/blog';

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    // Find the topmost visible heading
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length > 0) {
      setActiveId(visible[0].target.id);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings, handleObserver]);

  if (headings.length < 3) return null;

  return (
    <>
      {/* Mobile: collapsible */}
      <nav className="lg:hidden mb-8" aria-label="Table of contents">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-ink"
        >
          <span>Table of Contents</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {isOpen && (
          <ul className="mt-2 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm py-1 transition-colors ${
                    activeId === heading.id
                      ? 'text-[#2D6A4F] font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Desktop: sticky sidebar */}
      <nav
        className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
        aria-label="Table of contents"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">
          On this page
        </p>
        <ul className="space-y-1 border-l border-stone-200">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 2) * 12 + 16}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={`block text-sm py-1 transition-colors border-l-2 -ml-px ${
                  activeId === heading.id
                    ? 'border-[#2D6A4F] text-[#2D6A4F] font-semibold'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-stone-300'
                }`}
                style={{ paddingLeft: '12px' }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
