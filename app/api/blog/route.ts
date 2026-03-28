import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function getLocaleDir(locale: string) {
  return path.join(CONTENT_DIR, locale);
}

// GET /api/blog?locale=en — list all posts with full content
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
  const dir = getLocaleDir(locale);

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ posts: [] });
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    const publishDate = data.publishDate ?? data.date ?? '';
    const today = new Date().toISOString().slice(0, 10);
    return {
      slug: data.slug ?? file.replace(/\.md$/, ''),
      title: data.title ?? '',
      date: data.date ?? '',
      publishDate,
      scheduled: publishDate > today,
      description: data.description ?? '',
      keywords: data.keywords ?? [],
      content,
      fileName: file,
    };
  });

  posts.sort((a, b) => (a.date > b.date ? -1 : 1));
  return NextResponse.json({ posts });
}

// POST /api/blog — create a new post
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, slug, date, publishDate, description, keywords, content, locale } = body as {
    title: string;
    slug: string;
    date: string;
    publishDate?: string;
    description: string;
    keywords: string[];
    content: string;
    locale?: string;
  };

  if (!title || !slug || !date || !content) {
    return NextResponse.json(
      { error: 'Missing required fields: title, slug, date, content' },
      { status: 400 }
    );
  }

  // Sanitize slug
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const loc = locale ?? 'en';
  const dir = getLocaleDir(loc);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${safeSlug}.md`);
  if (fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
  }

  const meta: Record<string, unknown> = {
    title,
    date,
    slug: safeSlug,
    description: description ?? '',
    keywords: keywords ?? [],
  };
  if (publishDate && publishDate !== date) {
    meta.publishDate = publishDate;
  }
  const frontmatter = matter.stringify(content, meta);

  try {
    fs.writeFileSync(filePath, frontmatter, 'utf-8');
  } catch {
    return NextResponse.json(
      { error: 'Blog editing is not available in this environment' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, slug: safeSlug }, { status: 201 });
}
