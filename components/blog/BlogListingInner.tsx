'use client';

import { useSearchParams } from 'next/navigation';
import type { BlogPostMeta } from '@/lib/blog';
import type { BlogCategory } from '@/lib/blog-categories';
import CategoryFilter from './CategoryFilter';
import BlogCard from './BlogCard';

interface BlogListingInnerProps {
  posts: BlogPostMeta[];
  locale: 'en' | 'ko';
}

export default function BlogListingInner({ posts, locale }: BlogListingInnerProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') as BlogCategory | null;

  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <>
      <CategoryFilter locale={locale} />
      <div className="space-y-4">
        {filtered.map((post) => (
          <BlogCard key={post.slug} post={post} locale={locale} />
        ))}
        {filtered.length === 0 && (
          <p className="text-ink-muted text-sm py-8 text-center">
            {locale === 'ko' ? '해당 카테고리에 글이 없습니다.' : 'No posts in this category.'}
          </p>
        )}
      </div>
    </>
  );
}
