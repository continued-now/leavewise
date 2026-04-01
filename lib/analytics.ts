// Typed GA4 event helpers — all no-ops if NEXT_PUBLIC_GA_MEASUREMENT_ID is not set

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function send(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

export function trackOptimize(country: string, ptoDays: number): void {
  send('optimize_pto', { country, pto_days: ptoDays });
}

export function trackAffiliateClick(windowLabel: string, type: 'flight' | 'hotel' | 'compare' | 'activities' | 'attractions' | 'esim' | 'google_cal'): void {
  send('affiliate_click', { window_label: windowLabel, link_type: type });
}

export function trackCalendarExport(format: 'ics' | 'png' | 'text'): void {
  send('calendar_export', { format });
}

export function trackSharePlan(): void {
  send('share_plan');
}

export function trackEmailSignup(): void {
  send('email_signup');
}

export function trackKakaoShare(): void {
  send('kakao_share');
}

export function trackCalendarDayClick(): void {
  send('calendar_day_click');
}

export function trackStrategySwitch(strategy: string): void {
  send('strategy_switch', { strategy });
}

export function trackSidebarToggle(section: string): void {
  send('sidebar_toggle', { section });
}

export function trackFlightCtaView(days: number): void {
  send('flight_cta_view', { days });
}

export function trackBlogScrollDepth(depth: number): void {
  send('blog_scroll_depth', { depth });
}

export function trackPlanSave(strategy: string): void {
  send('plan_save', { strategy });
}

export function trackPlanLoad(strategy: string): void {
  send('plan_load', { strategy });
}

export function trackPlanDelete(): void {
  send('plan_delete');
}

export function trackPlanCompare(): void {
  send('plan_compare');
}
