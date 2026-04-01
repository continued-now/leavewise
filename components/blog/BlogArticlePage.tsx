import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { getRelatedPosts, extractFAQSchema } from '@/lib/blog-utils';
import TableOfContents from '@/components/blog/TableOfContents';
import { ScrollTracker } from '@/components/blog/ScrollTracker';
import Breadcrumbs from './Breadcrumbs';
import CategoryBadge from './CategoryBadge';
import ReadingTime from './ReadingTime';
import SocialShareBar from './SocialShareBar';
import RelatedPosts from './RelatedPosts';

interface BlogArticlePageProps {
  locale: 'en' | 'ko';
  slug: string;
  isPreview: boolean;
}

export default async function BlogArticlePage({ locale, slug, isPreview }: BlogArticlePageProps) {
  const post = await getPostBySlug(locale, slug, isPreview);
  if (!post) notFound();

  const allPosts = getAllPosts(locale);
  const relatedPosts = getRelatedPosts(post.slug, allPosts, 3);
  const faqSchema = extractFAQSchema(post.headings, post.contentHtml);

  const baseUrl = 'https://leavewise.app';
  const blogPath = locale === 'ko' ? `/ko/blog/${post.slug}` : `/blog/${post.slug}`;
  const fullUrl = `${baseUrl}${blogPath}`;
  const blogListPath = locale === 'ko' ? '/ko/blog' : '/blog';
  const optimizePath = locale === 'ko' ? '/optimize?country=KR' : '/optimize?country=US';

  const isEn = locale === 'en';
  const dateLocale = isEn ? 'en-US' : 'ko-KR';

  // Rewrite /optimize links to include country param
  const processedHtml = post.contentHtml.replace(
    /href="\/optimize"/g,
    `href="${optimizePath}"`,
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updatedDate ?? post.date,
    author: { '@type': 'Organization', name: 'Leavewise', url: baseUrl },
    publisher: { '@type': 'Organization', name: 'Leavewise', url: baseUrl },
    mainEntityOfPage: { '@type': 'WebPage', '@id': fullUrl },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : '홈', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: isEn ? 'Blog' : '블로그', item: `${baseUrl}${blogListPath}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: fullUrl },
    ],
  };

  const hasToc = post.headings.length >= 3;

  const previewBanner = isPreview && (
    <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 font-medium max-w-3xl">
      {isEn
        ? 'Preview mode — this post is scheduled and not yet visible to readers.'
        : '미리보기 — 이 글은 아직 공개되지 않은 예약 게시물입니다.'}
    </div>
  );

  const ctaText = isEn
    ? { heading: 'Ready to optimize your PTO?', sub: 'See every vacation window in your year — calculated automatically around your holidays.', button: 'Plan my time off' }
    : { heading: '연차 최적화할 준비가 되셨나요?', sub: '공휴일을 기준으로 최적의 휴가 일정을 자동으로 계산해 드립니다.', button: '내 연차 최적화하기' };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {previewBanner}
      <Breadcrumbs locale={locale} postTitle={post.title} />

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
          {isEn && <ScrollTracker />}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <time className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
                {new Intl.DateTimeFormat(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(post.date))}
              </time>
              <CategoryBadge category={post.category} locale={locale} />
              <ReadingTime minutes={post.readingTime} locale={locale} />
            </div>
            {post.updatedDate && (
              <p className="text-xs text-ink-muted mb-2">
                {isEn ? 'Updated' : '수정됨'}: {new Intl.DateTimeFormat(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(post.updatedDate))}
              </p>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2 leading-tight">
              {post.title}
            </h1>
            <SocialShareBar url={fullUrl} title={post.title} description={post.description} locale={locale} />
          </header>

          <div
            className="prose prose-stone max-w-none prose-headings:font-display prose-a:text-teal prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />

          <RelatedPosts posts={relatedPosts} locale={locale} />

          <div className="mt-12 bg-teal/5 border border-teal/15 rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-lg font-display font-semibold text-ink mb-2">{ctaText.heading}</p>
            <p className="text-sm text-ink-muted mb-4">{ctaText.sub}</p>
            <Link
              href={optimizePath}
              className="inline-block bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-hover transition-colors text-sm"
            >
              {ctaText.button}
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
