import BlogListingPage from '@/components/blog/BlogListingPage';

export const dynamic = 'force-dynamic';

export default function BlogIndex() {
  return <BlogListingPage locale="en" />;
}
