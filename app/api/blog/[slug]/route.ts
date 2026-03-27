import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function findPostFile(locale: string, slug: string): string | null {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return null;

  // Direct match first
  const direct = path.join(dir, `${slug}.md`);
  if (fs.existsSync(direct)) return direct;

  // Search by frontmatter slug
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = matter(raw);
    if (data.slug === slug) return path.join(dir, file);
  }

  return null;
}

// GET /api/blog/[slug]?locale=en — get single post with raw markdown
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
  const filePath = findPostFile(locale, slug);

  if (!filePath) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const publishDate = data.publishDate ?? data.date ?? '';
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    slug: data.slug ?? slug,
    title: data.title ?? '',
    date: data.date ?? '',
    publishDate,
    scheduled: publishDate > today,
    description: data.description ?? '',
    keywords: data.keywords ?? [],
    content,
  });
}

// PUT /api/blog/[slug] — update an existing post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
  const filePath = findPostFile(locale, slug);

  if (!filePath) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, date, publishDate, description, keywords, content, newSlug } = body as {
    title?: string;
    date?: string;
    publishDate?: string;
    description?: string;
    keywords?: string[];
    content?: string;
    newSlug?: string;
  };

  // Read existing
  const raw = fs.readFileSync(filePath, 'utf-8');
  const existing = matter(raw);

  // Merge updates
  const updatedData: Record<string, unknown> = {
    ...existing.data,
    ...(title !== undefined && { title }),
    ...(date !== undefined && { date }),
    ...(publishDate !== undefined && { publishDate }),
    ...(description !== undefined && { description }),
    ...(keywords !== undefined && { keywords }),
  };

  const updatedContent = content !== undefined ? content : existing.content;

  // Handle slug rename
  const finalSlug = newSlug
    ? newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : slug;

  updatedData.slug = finalSlug;

  const frontmatter = matter.stringify(updatedContent, updatedData);

  // If slug changed, write new file and delete old
  if (newSlug && finalSlug !== slug) {
    const dir = path.join(CONTENT_DIR, locale);
    const newPath = path.join(dir, `${finalSlug}.md`);
    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: 'A post with the new slug already exists' }, { status: 409 });
    }
    fs.writeFileSync(newPath, frontmatter, 'utf-8');
    fs.unlinkSync(filePath);
  } else {
    fs.writeFileSync(filePath, frontmatter, 'utf-8');
  }

  return NextResponse.json({ success: true, slug: finalSlug });
}

// DELETE /api/blog/[slug]?locale=en — delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
  const filePath = findPostFile(locale, slug);

  if (!filePath) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
