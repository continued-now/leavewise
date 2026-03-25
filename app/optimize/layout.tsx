import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Optimize your PTO — Leavewise',
  description:
    'Plan your paid time off around public holidays and get the most days off with the fewest PTO days.',
  openGraph: {
    title: 'Optimize your PTO — Leavewise',
    description:
      'Plan your paid time off around public holidays and get the most days off with the fewest PTO days.',
  },
  twitter: {
    title: 'Optimize your PTO — Leavewise',
    description:
      'Plan your paid time off around public holidays and get the most days off with the fewest PTO days.',
  },
};

export default function OptimizeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
