import BlogListingPage from '@/components/blog/BlogListingPage';

export const dynamic = 'force-dynamic';

export default function KoBlogIndex() {
  return <BlogListingPage locale="ko" />;
}
