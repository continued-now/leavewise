import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://leavewise.app';

export async function GET() {
  const posts = getAllPosts('ko');

  const items = posts
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/ko/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/ko/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Leavewise 블로그</title>
    <link>${BASE_URL}/ko/blog</link>
    <description>공휴일을 활용한 연차 최적화 팁과 전략.</description>
    <language>ko</language>
    <atom:link href="${BASE_URL}/ko/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
