import type { Metadata } from 'next';
import { LandingPageContent } from '@/components/LandingPageContent';

export const metadata: Metadata = {
  title: 'Leavewise — 적은 연차로 더 긴 휴가를',
  description:
    'Leavewise가 공휴일 브릿지, 긴 주말, 연간 캘린더 빈틈을 모두 찾아 적은 연차로 더 많은 휴가를 만들어 드립니다. 한국 공휴일 기준.',
  openGraph: {
    title: 'Leavewise — 적은 연차로 더 긴 휴가를',
    description: '한국 공휴일에 맞춘 스마트 연차 최적화. 영원히 무료.',
    type: 'website',
    siteName: 'Leavewise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leavewise — 적은 연차로 더 긴 휴가를',
    description: '한국 공휴일에 맞춘 스마트 연차 최적화. 영원히 무료.',
  },
};

export default function KoPage() {
  return <LandingPageContent initialLocale="ko" country="KR" />;
}
