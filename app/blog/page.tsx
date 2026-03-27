import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export default function BlogIndex() {
  const posts = getAllPosts('en');

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Blog</h1>
      <p className="text-ink-muted text-sm mb-10">
        Tips and strategies for getting the most out of your time off.
      </p>

      {posts.length === 0 ? (
        <p className="text-ink-muted">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="bg-white rounded-2xl border border-border p-6 hover:border-teal/40 transition-colors">
                <time className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(post.date))}
                </time>
                <h2 className="font-display text-xl font-semibold text-ink mt-1.5 group-hover:text-teal transition-colors">
                  {post.title}
                </h2>
                <p className="text-ink-soft text-sm mt-2 leading-relaxed">{post.description}</p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
