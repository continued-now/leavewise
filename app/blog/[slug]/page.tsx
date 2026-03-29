import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import TableOfContents from '@/components/blog/TableOfContents';
import { ScrollTracker } from '@/components/blog/ScrollTracker';

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
  const post = await getPostBySlug('en', slug, preview === '1');
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === '1';
  const post = await getPostBySlug('en', slug, isPreview);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'Leavewise',
      url: 'https://leavewise.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Leavewise',
      url: 'https://leavewise.app',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://leavewise.app/blog/${post.slug}`,
    },
  };

  const hasToc = post.headings.length >= 3;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {isPreview && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 font-medium max-w-3xl">
          Preview mode — this post is scheduled and not yet visible to readers.
        </div>
      )}
      <Link
        href="/blog"
        className="text-sm text-ink-muted hover:text-teal transition-colors inline-flex items-center gap-1 mb-8"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        All posts
      </Link>

      {/* Mobile TOC */}
      {hasToc && (
        <div className="lg:hidden">
          <TableOfContents headings={post.headings} />
        </div>
      )}

      <div className={hasToc ? 'lg:grid lg:grid-cols-[220px_1fr] lg:gap-10' : ''}>
        {/* Desktop TOC sidebar */}
        {hasToc && (
          <aside className="hidden lg:block">
            <TableOfContents headings={post.headings} />
          </aside>
        )}

        <article className="relative max-w-3xl">
          <ScrollTracker />
          <header className="mb-8">
            <time className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
              {new Intl.DateTimeFormat('en-US', {
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
            className="prose prose-stone max-w-none prose-headings:font-display prose-a:text-teal prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          <div className="mt-12 bg-teal/5 border border-teal/15 rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-lg font-display font-semibold text-ink mb-2">
              Ready to optimize your PTO?
            </p>
            <p className="text-sm text-ink-muted mb-4">
              See every vacation window in your year — calculated automatically around your holidays.
            </p>
            <Link
              href="/optimize"
              className="inline-block bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-hover transition-colors text-sm"
            >
              Plan my time off
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
