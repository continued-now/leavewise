import type { Metadata, Viewport } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1A6363',
};

export const metadata: Metadata = {
  title: 'Leavewise — Turn PTO into maximum time off',
  description:
    'Leavewise finds every holiday bridge, long weekend, and calendar gap in your year — so you spend fewer PTO days and get more life.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Leavewise — Turn PTO into maximum time off',
    description: 'Smart vacation planning around public holidays. Free forever.',
    type: 'website',
    siteName: 'Leavewise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leavewise — Turn PTO into maximum time off',
    description: 'Smart vacation planning around public holidays. Free forever.',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        {/* Anti-FOIT: apply dark mode before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('leavewise_theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}})();`,
          }}
        />
        {/* Travelpayouts affiliate tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.createElement("script");s.async=1;s.src="https://emrld.ltd/NTExNjE2.js?t=511616";document.head.appendChild(s);})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Leavewise',
              description: 'Smart PTO optimizer that finds every holiday bridge, long weekend, and calendar gap — so you spend fewer PTO days and get more time off.',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
      </head>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {KAKAO_KEY && (
        <>
          <Script
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
          <Script id="kakao-init" strategy="afterInteractive">
            {`if(window.Kakao&&!window.Kakao.isInitialized()){window.Kakao.init('${KAKAO_KEY}');}`}
          </Script>
        </>
      )}
      <body className="min-h-screen bg-cream">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
