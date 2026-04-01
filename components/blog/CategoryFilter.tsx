'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog-categories';
import { trackBlogCategoryFilter } from '@/lib/analytics';

interface CategoryFilterProps {
  locale: 'en' | 'ko';
}

const CATEGORY_KEYS: BlogCategory[] = ['holiday-guide', 'strategy', 'travel-tips', 'tools'];

export default function CategoryFilter({ locale }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = searchParams.get('category') ?? 'all';

  function handleClick(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    trackBlogCategoryFilter(category);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }

  const allLabel = locale === 'ko' ? '전체' : 'All';

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => handleClick('all')}
        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          active === 'all'
            ? 'bg-teal text-white border-teal'
            : 'bg-white text-ink-muted border-border hover:border-teal/40'
        }`}
      >
        {allLabel}
      </button>
      {CATEGORY_KEYS.map((key) => {
        const config = BLOG_CATEGORIES[key];
        return (
          <button
            key={key}
            onClick={() => handleClick(key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              active === key
                ? 'bg-teal text-white border-teal'
                : 'bg-white text-ink-muted border-border hover:border-teal/40'
            }`}
          >
            {config.labels[locale]}
          </button>
        );
      })}
    </div>
  );
}
