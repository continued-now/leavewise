import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export default function KoBlogIndex() {
  const posts = getAllPosts('ko');

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">블로그</h1>
      <p className="text-ink-muted text-sm mb-10">
        연차를 최대한 활용하는 팁과 전략을 공유합니다.
      </p>

      {posts.length === 0 ? (
        <p className="text-ink-muted">아직 게시글이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/ko/blog/${post.slug}`} className="block group">
              <article className="bg-white rounded-2xl border border-border p-6 hover:border-teal/40 transition-colors">
                <time className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
                  {new Intl.DateTimeFormat('ko-KR', {
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
