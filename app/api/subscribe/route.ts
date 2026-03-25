import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rate-limit';

const BodySchema = z.object({
  email: z.string().email(),
  locale: z.enum(['en', 'ko']).default('en'),
});

export async function POST(request: NextRequest) {
  // Rate limit: 5 signups per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const rl = checkRateLimit(`subscribe:${ip}`, 5);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, locale } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    // Resend not configured — return success silently (dev/staging without credentials)
    console.warn('[subscribe] Resend not configured — skipping email capture');
    return NextResponse.json({ success: true });
  }

  try {
    const resend = new Resend(apiKey);

    // Add contact to Resend audience
    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    // Send welcome email with calendar link
    const isKo = locale === 'ko';
    await resend.emails.send({
      from: 'Leavewise <hello@leavewise.com>',
      to: email,
      subject: isKo ? '2026 연차 캘린더가 도착했습니다 🗓️' : 'Your 2026 PTO Calendar is here 🗓️',
      html: isKo
        ? `<p>안녕하세요,</p>
           <p>2026년 인쇄용 연차 캘린더를 보내드립니다.</p>
           <p><a href="https://leavewise.com/calendar/print?src=email">캘린더 보기 →</a></p>
           <p>감사합니다,<br/>Leavewise 팀</p>`
        : `<p>Hi there,</p>
           <p>Here's your free 2026 PTO calendar — ready to print or save.</p>
           <p><a href="https://leavewise.com/calendar/print?src=email">View your calendar →</a></p>
           <p>Thanks,<br/>The Leavewise Team</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscribe] Resend error:', err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
