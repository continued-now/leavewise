import { Suspense } from 'react';
import { getAllPosts } from '@/lib/blog';
import { getSeasonalHeroPost } from '@/lib/blog-utils';
import SeasonalHero from './SeasonalHero';
import BlogListingInner from './BlogListingInner';

interface BlogListingPageProps {
  locale: 'en' | 'ko';
}

export default function BlogListingPage({ locale }: BlogListingPageProps) {
  const posts = getAllPosts(locale);
  const heroResult = getSeasonalHeroPost(posts, locale);
  const title = locale === 'ko' ? '블로그' : 'Blog';
  const subtitle = locale === 'ko'
    ? '연차를 최대한 활용하는 팁과 전략을 공유합니다.'
    : 'Vacation hacks, holiday bridge guides, and PTO strategies.';
  const emptyMessage = locale === 'ko' ? '아직 게시글이 없습니다.' : 'No posts yet.';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">{title}</h1>
      <p className="text-ink-muted text-sm mb-10">{subtitle}</p>

      {heroResult && (
        <SeasonalHero post={heroResult.post} locale={locale} holidayName={heroResult.holidayName} />
      )}

      {posts.length === 0 ? (
        <p className="text-ink-muted">{emptyMessage}</p>
      ) : (
        <Suspense fallback={<div className="space-y-4">{posts.slice(0, 3).map(p => (
          <div key={p.slug} className="bg-white rounded-2xl border border-border p-6 animate-skeleton h-32" />
        ))}</div>}>
          <BlogListingInner posts={posts} locale={locale} />
        </Suspense>
      )}
    </div>
  );
}
