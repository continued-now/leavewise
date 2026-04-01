import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/blog';
import BlogArticlePage from '@/components/blog/BlogArticlePage';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const post = await getPostBySlug('en', slug, preview === '1');
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `https://leavewise.app/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updatedDate ?? post.date,
      authors: ['Leavewise'],
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  return <BlogArticlePage locale="en" slug={slug} isPreview={preview === '1'} />;
}
