import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import type { Root, Element } from 'hast';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  keywords: string[];
  contentHtml: string;
  headings: Heading[];
}

export type BlogPostMeta = Omit<BlogPost, 'contentHtml' | 'headings'>;

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Custom sanitize schema that allows `id` attributes on heading elements
 * without the default `user-content-` prefix that the clobber list applies.
 */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    h1: [...(defaultSchema.attributes?.h1 ?? []), 'id'],
    h2: [...(defaultSchema.attributes?.h2 ?? []), 'id'],
    h3: [...(defaultSchema.attributes?.h3 ?? []), 'id'],
    h4: [...(defaultSchema.attributes?.h4 ?? []), 'id'],
    h5: [...(defaultSchema.attributes?.h5 ?? []), 'id'],
    h6: [...(defaultSchema.attributes?.h6 ?? []), 'id'],
  },
  // Remove 'id' from clobber so heading ids are not prefixed
  clobber: (defaultSchema.clobber ?? []).filter((c: string) => c !== 'id'),
};

/**
 * Rehype plugin that extracts heading data from the tree.
 */
function rehypeExtractHeadings(headings: Heading[]) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const match = node.tagName.match(/^h([1-6])$/);
      if (!match) return;
      const id = (node.properties?.id as string) ?? '';
      if (!id) return;
      headings.push({
        id,
        text: toString(node),
        level: Number(match[1]),
      });
    });
  };
}

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

  const headings: Heading[] = [];

  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeExtractHeadings(headings))
    .use(rehypeStringify)
    .process(content);

  return {
    slug: data.slug ?? slug,
    title: data.title ?? '',
    date: data.date ?? '',
    description: data.description ?? '',
    keywords: data.keywords ?? [],
    contentHtml: String(result),
    headings,
  };
}
