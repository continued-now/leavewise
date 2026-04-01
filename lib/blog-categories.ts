export type BlogCategory = 'holiday-guide' | 'strategy' | 'travel-tips' | 'tools';

export interface CategoryConfig {
  labels: { en: string; ko: string };
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const BLOG_CATEGORIES: Record<BlogCategory, CategoryConfig> = {
  'holiday-guide': {
    labels: { en: 'Holiday Guide', ko: '휴일 가이드' },
    bgClass: 'bg-teal/10',
    textClass: 'text-teal',
    borderClass: 'border-teal/20',
  },
  strategy: {
    labels: { en: 'Strategy', ko: '전략' },
    bgClass: 'bg-sage/10',
    textClass: 'text-sage',
    borderClass: 'border-sage/20',
  },
  'travel-tips': {
    labels: { en: 'Travel Tips', ko: '여행 팁' },
    bgClass: 'bg-coral/10',
    textClass: 'text-coral',
    borderClass: 'border-coral/20',
  },
  tools: {
    labels: { en: 'Tools', ko: '도구' },
    bgClass: 'bg-amber/10',
    textClass: 'text-amber',
    borderClass: 'border-amber/20',
  },
};
