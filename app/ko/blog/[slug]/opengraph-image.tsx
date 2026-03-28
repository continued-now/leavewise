import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog';

export const alt = 'Leavewise 블로그 포스트';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug('ko', slug, true);
  const title = post?.title ?? 'Leavewise';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '60px',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            width: '80px',
            height: '6px',
            backgroundColor: '#2D6A4F',
            borderRadius: '3px',
            display: 'flex',
          }}
        />

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? 42 : 52,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              display: 'flex',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#2D6A4F',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              L
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#2D6A4F',
                display: 'flex',
              }}
            >
              Leavewise
            </div>
          </div>
          <div
            style={{
              fontSize: 16,
              color: '#6b7280',
              display: 'flex',
            }}
          >
            leavewise.co
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
