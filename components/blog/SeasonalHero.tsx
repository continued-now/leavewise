import Link from 'next/link';
import type { BlogPostMeta } from '@/lib/blog';

interface SeasonalHeroProps {
  post: BlogPostMeta;
  locale: 'en' | 'ko';
  holidayName?: string;
}

export default function SeasonalHero({ post, locale, holidayName }: SeasonalHeroProps) {
  if (!post) return null;
  const href = locale === 'ko' ? `/ko/blog/${post.slug}` : `/blog/${post.slug}`;
  const ctaLabel = locale === 'ko' ? '가이드 읽기' : 'Read the guide';
  const upcomingLabel = locale === 'ko' ? '다가오는 휴일' : 'Upcoming Holiday';

  return (
    <div className="bg-teal/5 border border-teal/15 rounded-2xl p-6 sm:p-8 mb-8">
      {holidayName && (
        <p className="text-xs font-semibold text-teal uppercase tracking-wide mb-2">
          {upcomingLabel}: {holidayName}
        </p>
      )}
      <h2 className="font-display text-2xl font-semibold text-ink mb-2">
        {post.title}
      </h2>
      <p className="text-ink-soft text-sm leading-relaxed mb-4 max-w-2xl">
        {post.description}
      </p>
      <Link
        href={href}
        className="inline-block bg-teal text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-hover transition-colors text-sm"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
