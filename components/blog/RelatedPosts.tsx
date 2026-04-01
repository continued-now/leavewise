import type { BlogPostMeta } from '@/lib/blog';
import BlogCard from './BlogCard';

interface RelatedPostsProps {
  posts: BlogPostMeta[];
  locale: 'en' | 'ko';
}

export default function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) return null;
  const heading = locale === 'ko' ? '관련 글' : 'Related Articles';
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold text-ink mb-6">{heading}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
