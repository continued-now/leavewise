import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getHolidayReminderEmail } from '@/lib/email-templates';

/**
 * POST /api/email/trigger
 * Protected by ADMIN_PASSWORD via Authorization header.
 * Sends a holiday reminder email to the Resend audience.
 *
 * Body: { holiday: string, dates: string, daysOff: number, ptoCost: number }
 * Returns: { sent: number }
 */
export async function POST(request: NextRequest) {
  // Auth check
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD not configured on server' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { holiday, dates, daysOff, ptoCost } = body as Record<string, unknown>;
  if (
    typeof holiday !== 'string' ||
    typeof dates !== 'string' ||
    typeof daysOff !== 'number' ||
    typeof ptoCost !== 'number'
  ) {
    return NextResponse.json(
      { error: 'Required fields: holiday (string), dates (string), daysOff (number), ptoCost (number)' },
      { status: 400 }
    );
  }

  // Resend setup
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.warn('[email/trigger] Resend not configured — skipping');
    return NextResponse.json({ sent: 0, note: 'Resend not configured' });
  }

  const resend = new Resend(apiKey);

  // Fetch audience contacts
  let contacts: { email: string }[] = [];
  try {
    const res = await resend.contacts.list({ audienceId });
    contacts = (res.data?.data ?? []).map((c: { email: string }) => ({ email: c.email }));
  } catch (err) {
    console.error('[email/trigger] Failed to list contacts:', err);
    return NextResponse.json({ error: 'Failed to fetch audience contacts' }, { status: 500 });
  }

  if (contacts.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Send emails — English version to all (could be extended with locale per contact)
  const { subject, html } = getHolidayReminderEmail(holiday, dates, daysOff, ptoCost, 'en');

  let sent = 0;
  const batchSize = 50;
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((c) =>
        resend.emails.send({
          from: 'Leavewise <hello@leavewise.com>',
          to: c.email,
          subject,
          html,
        })
      )
    );
    sent += results.filter((r) => r.status === 'fulfilled').length;
  }

  return NextResponse.json({ sent });
}
