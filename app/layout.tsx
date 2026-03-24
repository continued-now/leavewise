import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Leavewise — Turn PTO into maximum time off',
  description:
    'Leavewise finds every holiday bridge, long weekend, and calendar gap in your year — so you spend fewer PTO days and get more life.',
  openGraph: {
    title: 'Leavewise — Turn PTO into maximum time off',
    description: 'Smart vacation planning around public holidays. Free forever.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  );
}
