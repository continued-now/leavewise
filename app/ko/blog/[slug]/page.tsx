import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const post = await getPostBySlug('ko', slug, preview === '1');
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
  };
}

export default async function KoBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === '1';
  const post = await getPostBySlug('ko', slug, isPreview);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      {isPreview && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 font-medium">
          미리보기 — 이 글은 아직 공개되지 않은 예약 게시물입니다.
        </div>
      )}
      <Link
        href="/ko/blog"
        className="text-sm text-ink-muted hover:text-teal transition-colors inline-flex items-center gap-1 mb-8"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        모든 글
      </Link>

      <article>
        <header className="mb-8">
          <time className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
            {new Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date(post.date))}
          </time>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2 leading-tight">
            {post.title}
          </h1>
        </header>

        <div
          className="prose prose-stone max-w-none prose-headings:font-display prose-a:text-teal prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <div className="mt-12 bg-teal/5 border border-teal/15 rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-lg font-display font-semibold text-ink mb-2">
            연차 최적화할 준비가 되셨나요?
          </p>
          <p className="text-sm text-ink-muted mb-4">
            공휴일을 기준으로 최적의 휴가 일정을 자동으로 계산해 드립니다.
          </p>
          <Link
            href="/optimize"
            className="inline-block bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-hover transition-colors text-sm"
          >
            내 연차 최적화하기
          </Link>
        </div>
      </article>
    </div>
  );
}
