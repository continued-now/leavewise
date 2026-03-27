import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  keywords: string[];
  contentHtml: string;
}

export type BlogPostMeta = Omit<BlogPost, 'contentHtml'>;

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Returns all published posts for a locale.
 * Posts with a `publishDate` in the future are excluded unless includeScheduled is true.
 */
export function getAllPosts(locale: 'en' | 'ko', includeScheduled = false): BlogPostMeta[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];

  const today = new Date().toISOString().slice(0, 10);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const posts: BlogPostMeta[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = matter(raw);
    const publishDate: string = data.publishDate ?? data.date ?? '';

    // Skip future-dated posts unless explicitly requested
    if (!includeScheduled && publishDate > today) continue;

    posts.push({
      slug: data.slug ?? file.replace(/\.md$/, ''),
      title: data.title ?? '',
      date: data.date ?? '',
      description: data.description ?? '',
      keywords: data.keywords ?? [],
    });
  }

  posts.sort((a, b) => (a.date > b.date ? -1 : 1));
  return posts;
}

export async function getPostBySlug(
  locale: 'en' | 'ko',
  slug: string,
  includeScheduled = false
): Promise<BlogPost | null> {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  // Respect publish date
  const publishDate: string = data.publishDate ?? data.date ?? '';
  const today = new Date().toISOString().slice(0, 10);
  if (!includeScheduled && publishDate > today) return null;

  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content);

  return {
    slug: data.slug ?? slug,
    title: data.title ?? '',
    date: data.date ?? '',
    description: data.description ?? '',
    keywords: data.keywords ?? [],
    contentHtml: String(result),
  };
}
