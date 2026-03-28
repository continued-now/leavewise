import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://leavewise.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: { ko: `${BASE_URL}/ko` } },
    },
    {
      url: `${BASE_URL}/ko`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: { en: BASE_URL } },
    },
    {
      url: `${BASE_URL}/optimize`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calendar`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: { ko: `${BASE_URL}/ko/blog` } },
    },
    {
      url: `${BASE_URL}/ko/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: { en: `${BASE_URL}/blog` } },
    },
  ];

  // English blog posts (non-draft, non-future)
  const enPosts = getAllPosts('en');
  const enBlogPages: MetadataRoute.Sitemap = enPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Korean blog posts (non-draft, non-future)
  const koPosts = getAllPosts('ko');
  const koBlogPages: MetadataRoute.Sitemap = koPosts.map((post) => ({
    url: `${BASE_URL}/ko/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...enBlogPages, ...koBlogPages];
}
