/**
 * Holiday reminder email templates for re-engagement automation.
 * Returns { subject, html } for Resend transactional sends.
 */

interface EmailOutput {
  subject: string;
  html: string;
}

export function getHolidayReminderEmail(
  holiday: string,
  dates: string,
  daysOff: number,
  ptoCost: number,
  locale: 'en' | 'ko'
): EmailOutput {
  if (locale === 'ko') {
    return {
      subject: `[${holiday}] 4주 후입니다 — 연차 계획 세우셨나요?`,
      html: buildHtml({
        preheader: `${holiday}이(가) 다가옵니다. ${daysOff}일 연휴를 ${ptoCost}일 연차로 만드세요.`,
        heading: `${holiday}이 곧 다가옵니다`,
        body: `
          <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 16px">
            <strong>${holiday}</strong> (${dates})까지 4주 남았습니다.
          </p>
          <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 16px">
            연차 <strong>${ptoCost}일</strong>만 사용하면 <strong>${daysOff}일</strong> 연휴를 만들 수 있습니다.
          </p>
          <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 24px">
            지금 바로 최적의 연차 계획을 확인하세요.
          </p>
        `,
        ctaText: '연차 최적화하기',
        ctaUrl: 'https://leavewise.app/optimize?utm_source=email&utm_medium=reminder',
        footer: '더 이상 메일을 받지 않으시려면 아래 수신거부를 클릭하세요.',
      }),
    };
  }

  return {
    subject: `${holiday} is in 4 weeks — have you planned your time off?`,
    html: buildHtml({
      preheader: `${holiday} is coming up. Turn ${ptoCost} PTO days into ${daysOff} days off.`,
      heading: `${holiday} is just around the corner`,
      body: `
        <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 16px">
          <strong>${holiday}</strong> (${dates}) is only 4 weeks away.
        </p>
        <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 16px">
          With just <strong>${ptoCost} PTO days</strong>, you can create a <strong>${daysOff}-day</strong> break.
        </p>
        <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 24px">
          Plan the perfect getaway now — our optimizer finds the best windows automatically.
        </p>
      `,
      ctaText: 'Optimize my PTO',
      ctaUrl: 'https://leavewise.app/optimize?utm_source=email&utm_medium=reminder',
      footer: 'If you no longer wish to receive these emails, click unsubscribe below.',
    }),
  };
}

function buildHtml(opts: {
  preheader: string;
  heading: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  footer: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden">${opts.preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header bar -->
        <tr><td style="background-color:#2dd4bf;padding:24px 32px;border-radius:16px 16px 0 0">
          <a href="https://leavewise.app" style="color:#ffffff;font-size:20px;font-weight:700;text-decoration:none;letter-spacing:-0.02em">Leavewise</a>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:32px 32px 24px">
          <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 20px;line-height:1.3">${opts.heading}</h1>
          ${opts.body}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
            <tr><td style="background-color:#2dd4bf;border-radius:12px;padding:14px 32px">
              <a href="${opts.ctaUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">${opts.ctaText}</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#ffffff;padding:16px 32px 24px;border-radius:0 0 16px 16px;border-top:1px solid #e5e5e5">
          <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.5">${opts.footer}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
