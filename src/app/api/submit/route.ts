import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SubmissionPayload {
  answers: Record<string, unknown>;
  findings?: Array<{ title: string; detail: string; severity: string }>;
}

function escapeCsv(value: unknown) {
  const stringValue = value == null ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function sanitizeForFilename(value: string) {
  return value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function buildCsvContent(answers: Record<string, unknown>, findings: Array<{ title: string; detail: string; severity: string }>) {
  const rows = [
    ['Category', 'Value'],
    ['firstName', answers.firstName ?? ''],
    ['lastName', answers.lastName ?? ''],
    ['email', answers.email ?? ''],
    ['phoneNumber', answers.phoneNumber ?? ''],
    ['age', answers.age ?? ''],
    ['companyPlan', answers.companyPlan ?? ''],
    ['hsaContrib', answers.hsaContrib ?? ''],
    ['medicarePlan', answers.medicarePlan ?? ''],
    ['rothConversions', answers.rothConversions ?? ''],
    ['socialSecurity', answers.socialSecurity ?? ''],
    ['pre65Health', answers.pre65Health ?? ''],
    ['cashBuffer', answers.cashBuffer ?? ''],
    ['rmdKnowledge', answers.rmdKnowledge ?? ''],
    ['stateTaxCheck', answers.stateTaxCheck ?? ''],
    ['diagnosisCount', findings.length],
  ];

  findings.forEach((finding) => {
    rows.push(['finding', `${finding.severity}:${finding.title} | ${finding.detail}`]);
  });

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function buildTextBody(answers: Record<string, unknown>, findings: Array<{ title: string; detail: string; severity: string }>) {
  const lines = [
    'Retirement Questionnaire Results',
    '===============================',
    '',
    'Contact Information',
    '-------------------',
    `First Name: ${answers.firstName ?? ''}`,
    `Last Name: ${answers.lastName ?? ''}`,
    `Email: ${answers.email ?? ''}`,
    `Phone Number: ${answers.phoneNumber ?? ''}`,
    '',
    'Answers',
    '-------',
    `age: ${answers.age ?? ''}`,
    `companyPlan: ${answers.companyPlan ?? ''}`,
    `hsaContrib: ${answers.hsaContrib ?? ''}`,
    `medicarePlan: ${answers.medicarePlan ?? ''}`,
    `rothConversions: ${answers.rothConversions ?? ''}`,
    `socialSecurity: ${answers.socialSecurity ?? ''}`,
    `pre65Health: ${answers.pre65Health ?? ''}`,
    `cashBuffer: ${answers.cashBuffer ?? ''}`,
    `rmdKnowledge: ${answers.rmdKnowledge ?? ''}`,
    `stateTaxCheck: ${answers.stateTaxCheck ?? ''}`,
    '',
    'Findings',
    '--------',
  ];

  findings.forEach((finding) => {
    lines.push(`${finding.severity.toUpperCase()}: ${finding.title}`);
    lines.push(finding.detail);
    lines.push('');
  });

  return lines.join('\n');
}

export async function POST(request: Request) {
  const body = (await request.json()) as SubmissionPayload;
  const answers = body.answers ?? {};
  const findings = Array.isArray(body.findings) ? body.findings : [];

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim() || 'Retirement Check-Up <onboarding@resend.dev>';
  const recipientEmail = process.env.REPORT_RECIPIENT_EMAIL?.trim();
  const ccEmail = typeof answers.email === 'string' ? answers.email.trim() : '';

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY is not configured. Email delivery was skipped.');
    return NextResponse.json({
      ok: true,
      message: 'Email delivery was skipped because RESEND_API_KEY is not configured.',
      skipped: true,
    });
  }

  if (!recipientEmail) {
    return NextResponse.json(
      { error: 'REPORT_RECIPIENT_EMAIL is not configured. Set it in your environment to send emails.' },
      { status: 500 }
    );
  }

  const fullName = [answers.firstName, answers.lastName]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim())
    .join(' ');
  const subject = fullName ? `Retirement questionnaire results for ${fullName}` : 'Retirement questionnaire results';
  const filenamePrefix = fullName
    ? `retirement-questionnaire-results-${sanitizeForFilename(fullName)}`
    : 'retirement-questionnaire-results';

  const csvContent = buildCsvContent(answers as Record<string, unknown>, findings);
  const textBody = buildTextBody(answers as Record<string, unknown>, findings);
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2>Retirement Questionnaire Results</h2>
      <p>The responses below are also included as a CSV attachment for spreadsheet import.</p>
      <pre style="background:#f3f4f6;padding:16px;border-radius:8px;white-space:pre-wrap;">${textBody.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [recipientEmail],
      cc: ccEmail ? [ccEmail] : undefined,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: `${filenamePrefix}.csv`,
          content: Buffer.from(csvContent).toString('base64'),
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: 'Unable to send email.', details },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, message: 'Email sent successfully.' });
}
