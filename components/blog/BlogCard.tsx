import Link from 'next/link';
import type { BlogPostMeta } from '@/lib/blog';
import CategoryBadge from './CategoryBadge';
import ReadingTime from './ReadingTime';

interface BlogCardProps {
  post: BlogPostMeta;
  locale: 'en' | 'ko';
  featured?: boolean;
}

export default function BlogCard({ post, locale, featured }: BlogCardProps) {
  const href = locale === 'ko' ? `/ko/blog/${post.slug}` : `/blog/${post.slug}`;
  const dateFormatter = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Link href={href} className="block group">
      <article
        className={`bg-white rounded-2xl border border-border p-6 hover:border-teal/40 transition-colors ${
          featured ? 'border-l-4 border-l-teal' : ''
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <time className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
            {dateFormatter.format(new Date(post.date))}
          </time>
          <CategoryBadge category={post.category} locale={locale} />
          <ReadingTime minutes={post.readingTime} locale={locale} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink mt-1.5 group-hover:text-teal transition-colors">
          {post.title}
        </h2>
        <p className="text-ink-soft text-sm mt-2 leading-relaxed">{post.description}</p>
      </article>
    </Link>
  );
}
