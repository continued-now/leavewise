import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog-categories';

interface CategoryBadgeProps {
  category: BlogCategory;
  locale: 'en' | 'ko';
}

export default function CategoryBadge({ category, locale }: CategoryBadgeProps) {
  const config = BLOG_CATEGORIES[category];
  if (!config) return null;
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass}`}
    >
      {config.labels[locale]}
    </span>
  );
}
