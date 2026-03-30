import type { Metadata } from 'next';
import Link from 'next/link';
import { TrueCostCalculator } from '@/components/tools/TrueCostCalculator';

export const metadata: Metadata = {
  title: '항공권 실제 비용 계산기 — 저가항공이 정말 저렴할까? | Leavewise',
  description:
    '대체 공항의 실제 비용을 계산하세요. 택시, 전철, 이동 시간까지 포함한 진짜 비용을 비교합니다.',
  keywords: [
    '공항 비교 계산기',
    '항공권 실제 비용',
    '대체 공항 비용',
    '저가항공 숨은 비용',
    '공항 교통비 비교',
  ],
  openGraph: {
    title: '저가항공이 정말 저렴할까?',
    description: '교통비와 이동 시간까지 고려한 실제 비용을 계산해보세요.',
  },
};

export default function AirportComparePageKo() {
  return (
    <main id="main-content" className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-ink-muted mb-6">
          <Link href="/ko" className="hover:text-teal transition-colors">Leavewise</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-soft">실제 비용 계산기</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ink tracking-tight leading-tight">
            &ldquo;저렴한&rdquo; 항공편이 <span className="text-coral">정말</span> 저렴할까?
          </h1>
          <p className="mt-3 text-ink-soft leading-relaxed">
            항공권에서 13만원을 아꼈더니 택시비 6만원에 2시간을 더 이동했다면,
            과연 절약한 걸까요? 이 계산기는 교통비, 이동 시간, 그리고 <strong>나의 시간 가치</strong>를
            모두 반영해서 어떤 공항이 진짜 이득인지 보여줍니다.
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            핵심 질문: &ldquo;어떤 항공편이 가장 싼가?&rdquo;가 아니라 &ldquo;내 시간은 얼마짜리인가?&rdquo;
          </p>
        </header>

        {/* Calculator */}
        <TrueCostCalculator locale="ko" />

        {/* Guide content */}
        <section className="mt-12 space-y-8">
          <h2 className="text-xl font-display font-bold text-ink">대체 공항, 언제 이득이고 언제 손해일까?</h2>

          <div className="space-y-6 text-sm text-ink-soft leading-relaxed">
            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-sage text-base mb-2">대체 공항이 이득인 경우</h3>
              <ul className="space-y-2 list-disc list-inside marker:text-sage">
                <li><strong>항공권 차이가 15만원 이상일 때</strong> &mdash; 교통비를 흡수하고도 남을 정도의 차이</li>
                <li><strong>대중교통으로 연결될 때</strong> &mdash; 5천원 전철 vs 5만원 택시는 결과가 완전히 다릅니다</li>
                <li><strong>여러 명이 함께 여행할 때</strong> &mdash; 교통비는 나눠 내지만 항공권 절약은 인원수만큼 곱해집니다</li>
                <li><strong>대체 공항이 목적지에 오히려 가까울 때</strong> &mdash; 예: 오사카 여행 시 이타미(ITM) vs 간사이(KIX)</li>
                <li><strong>시간에 여유가 있을 때</strong> &mdash; 하루 종일 시간이 있다면 1시간 더 이동해도 괜찮습니다</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-coral text-base mb-2">대체 공항이 손해인 경우</h3>
              <ul className="space-y-2 list-disc list-inside marker:text-coral">
                <li><strong>차이가 8만원 미만일 때</strong> &mdash; 교통비와 시간에 거의 다 잡아먹힙니다</li>
                <li><strong>택시/우버가 필수일 때</strong> &mdash; 공항 근처 할증 요금은 예상보다 훨씬 비쌀 수 있습니다</li>
                <li><strong>밤늦게 도착할 때</strong> &mdash; 대중교통 마감, 심야 할증, 안전 문제까지</li>
                <li><strong>아이나 큰 짐이 있을 때</strong> &mdash; 이동이 길어질수록 체감 피로가 기하급수적으로 늘어납니다</li>
                <li><strong>렌트카를 빌릴 예정일 때</strong> &mdash; 같은 도시라도 공항별로 렌트카 가격이 크게 다를 수 있습니다</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-ink text-base mb-2">&ldquo;시간 가치&rdquo;라는 사고방식</h3>
              <p>
                대부분의 알뜰 여행 조언은 시간의 비용을 무시합니다.
                하지만 시간에는 실제 가치가 있습니다, 특히 휴가 중에는요.
              </p>
              <p className="mt-2">
                이렇게 생각해보세요: 누군가가 &ldquo;셔틀버스에서 2시간 더 앉아 있으면 3만원 줄게&rdquo;라고 한다면
                받으시겠어요? 그게 바로 더 먼 공항으로 3만원 아끼려고 할 때 하는 일입니다.
              </p>
              <p className="mt-2">
                위의 슬라이더로 나의 시간 가치를 정해보세요.
                이동 시간이 정말 상관없다면 $0으로 설정하시고,
                휴가의 매 순간이 소중하다면 높게 설정하세요.
                정답은 없습니다 &mdash; 솔직한 답만 있을 뿐입니다.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-ink text-base mb-2">꿀팁</h3>
              <ul className="space-y-2 list-disc list-inside marker:text-teal">
                <li><strong>항공권 예매 전에 교통편부터 확인하세요</strong> &mdash; 도착 예정 시간에 맞춰 구글 맵으로 경로 검색</li>
                <li><strong>왕복을 고려하세요</strong> &mdash; 계산기가 자동으로 교통비를 2배로 계산합니다</li>
                <li><strong>두 공항의 렌트카 가격을 비교하세요</strong> &mdash; &ldquo;저렴한&rdquo; 공항의 렌트카가 더 비쌀 수 있습니다</li>
                <li><strong>주차비도 체크하세요</strong> &mdash; 대체 공항이 주차비가 훨씬 저렴한 경우가 많습니다</li>
                <li><strong>저가항공의 추가 비용을 확인하세요</strong> &mdash; 수하물, 좌석 선택, 변경 수수료 등 숨은 비용</li>
              </ul>
            </div>

            {/* Japan-specific section for Korean travelers */}
            <div className="p-4 rounded-xl border border-teal/20 bg-teal-light/20">
              <h3 className="font-display font-semibold text-teal text-base mb-2">일본 여행 공항 비교 가이드</h3>
              <p className="mb-3">한국에서 일본 여행 시 가장 흔한 공항 선택 고민:</p>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-ink text-xs">도쿄: 하네다(HND) vs 나리타(NRT)</p>
                  <p className="text-xs">하네다는 시내 25분, 나리타는 75분+. 나리타가 3-5만원 저렴해도 교통비와 시간 차이를 계산하면 하네다가 거의 항상 이깁니다. 특히 김포-하네다 노선은 시간 절약이 압도적.</p>
                </div>
                <div>
                  <p className="font-semibold text-ink text-xs">오사카: 이타미(ITM) vs 간사이(KIX)</p>
                  <p className="text-xs">이타미는 시내 30분, 간사이는 60분+. 간사이는 LCC가 많아 가격이 저렴하지만, 오사카 시내 숙소라면 이타미의 편의성을 돈으로 환산해보세요.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 p-5 rounded-xl bg-teal-light/40 border border-teal/10 text-center">
          <p className="text-sm font-semibold text-ink">여행 날짜가 정해졌나요?</p>
          <p className="text-xs text-ink-muted mt-1">
            Leavewise가 2026년 최적 연차 배치를 계산하고, 각 연휴의 항공권 가격까지 보여드립니다.
          </p>
          <Link
            href="/optimize"
            className="mt-3 inline-block px-5 py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-hover transition-colors"
          >
            연차 최적화하기
          </Link>
        </div>

        <footer className="mt-8 text-center text-xs text-ink-muted">
          <p>교통비와 소요 시간은 평균적인 추정치입니다. 실제 가격은 항상 확인해주세요.</p>
        </footer>
      </div>
    </main>
  );
}
