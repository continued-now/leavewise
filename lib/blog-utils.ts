import type { Heading } from './blog';
import { CALENDAR_DATA } from './calendar-data';
import type { BlogCategory } from './blog-categories';

interface BlogPostMetaWithCategory {
  slug: string;
  title: string;
  date: string;
  description: string;
  keywords: string[];
  category: BlogCategory;
  readingTime: number;
  updatedDate?: string;
}

/**
 * Returns related posts based on keyword Jaccard similarity and category match.
 */
export function getRelatedPosts(
  currentSlug: string,
  allPosts: BlogPostMetaWithCategory[],
  limit = 3,
): BlogPostMetaWithCategory[] {
  const current = allPosts.find((p) => p.slug === currentSlug);
  if (!current) return allPosts.slice(0, limit);

  const currentKeywords = new Set(current.keywords.map((k) => k.toLowerCase()));
  const others = allPosts.filter((p) => p.slug !== currentSlug);

  const scored = others.map((post) => {
    const postKeywords = new Set(post.keywords.map((k) => k.toLowerCase()));

    const intersection = new Set(
      [...currentKeywords].filter((k) => postKeywords.has(k)),
    );
    const union = new Set([...currentKeywords, ...postKeywords]);
    const jaccard = union.size > 0 ? intersection.size / union.size : 0;

    const categoryBonus = post.category === current.category ? 0.3 : 0;

    return { post, score: jaccard + categoryBonus };
  });

  scored.sort((a, b) => b.score - a.score);

  const results = scored.filter((s) => s.score > 0).map((s) => s.post);

  if (results.length < limit) {
    const slugsUsed = new Set(results.map((r) => r.slug));
    const sameCategoryRecent = others
      .filter((p) => p.category === current.category && !slugsUsed.has(p.slug))
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    for (const post of sameCategoryRecent) {
      if (results.length >= limit) break;
      results.push(post);
    }
  }

  return results.slice(0, limit);
}

/**
 * Finds a seasonally-relevant hero post based on the next upcoming holiday.
 */
export function getSeasonalHeroPost(
  posts: BlogPostMetaWithCategory[],
  locale: 'en' | 'ko',
): { post: BlogPostMetaWithCategory; holidayName: string } | null {
  const countryKey = locale === 'ko' ? 'kr' : 'us';
  const calendarData = CALENDAR_DATA[countryKey];
  if (!calendarData) return null;

  const now = new Date();
  const holidays = calendarData.holidays;

  // Find next holiday within 0-60 days
  let nextHoliday: { date: string; name: string } | null = null;
  for (const h of holidays) {
    const holidayDate = new Date(h.date + 'T00:00:00');
    const diffMs = holidayDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 60) {
      nextHoliday = h;
      break;
    }
  }

  if (!nextHoliday) return null;

  // Tokenize holiday name
  const tokens = nextHoliday.name
    .toLowerCase()
    .split(/[\s\-\(\)\.,']+/)
    .filter((t) => t.length > 2);

  if (tokens.length === 0) return null;

  // Score holiday-guide posts by token matches
  const holidayPosts = posts.filter((p) => p.category === 'holiday-guide');

  let bestPost: BlogPostMetaWithCategory | null = null;
  let bestScore = 0;

  for (const post of holidayPosts) {
    const searchText = `${post.slug} ${post.title} ${post.keywords.join(' ')}`.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (searchText.includes(token)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPost = post;
    }
  }

  if (!bestPost || bestScore === 0) return null;

  return { post: bestPost, holidayName: nextHoliday.name };
}

/**
 * Extracts FAQ structured data from headings that end with "?".
 */
export function extractFAQSchema(
  headings: Heading[],
  contentHtml: string,
): object | null {
  const questionHeadings = headings.filter((h) => h.text.trim().endsWith('?'));

  if (questionHeadings.length < 2) return null;

  const pairs: { question: string; answer: string }[] = [];

  for (const heading of questionHeadings) {
    // Find the heading by its id, then grab content until the next heading
    const idEscaped = heading.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      `id="${idEscaped}"[^>]*>.*?</h[1-6]>([\\s\\S]*?)(?=<h[2-6][ >]|$)`,
    );
    const match = contentHtml.match(regex);

    if (match && match[1]) {
      // Strip HTML tags
      const answer = match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (answer.length > 0) {
        pairs.push({ question: heading.text.trim(), answer });
      }
    }
  }

  if (pairs.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map((pair) => ({
      '@type': 'Question',
      name: pair.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: pair.answer,
      },
    })),
  };
}
