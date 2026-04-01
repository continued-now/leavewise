import Link from 'next/link';

interface BreadcrumbsProps {
  locale: 'en' | 'ko';
  postTitle: string;
}

export default function Breadcrumbs({ locale, postTitle }: BreadcrumbsProps) {
  const homeLabel = locale === 'ko' ? '홈' : 'Home';
  const blogLabel = locale === 'ko' ? '블로그' : 'Blog';
  const blogHref = locale === 'ko' ? '/ko/blog' : '/blog';
  const homeHref = locale === 'ko' ? '/ko' : '/';

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-muted mb-6 overflow-hidden">
      <Link href={homeHref} className="hover:text-teal transition-colors shrink-0">
        {homeLabel}
      </Link>
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <Link href={blogHref} className="hover:text-teal transition-colors shrink-0">
        {blogLabel}
      </Link>
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <span className="truncate max-w-[200px]" title={postTitle}>
        {postTitle}
      </span>
    </nav>
  );
}
