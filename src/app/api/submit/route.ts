import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SubmissionPayload {
  answers: Record<string, unknown>;
  findings?: Array<{ title: string; detail: string; severity: string }>;
  recipientEmail?: string;
  ccEmail?: string;
}

function escapeCsv(value: unknown) {
  const stringValue = value == null ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function buildCsvContent(answers: Record<string, unknown>, findings: Array<{ title: string; detail: string; severity: string }>) {
  const rows = [
    ['Category', 'Value'],
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
  const recipientEmail = body.recipientEmail?.trim();
  const ccEmail = body.ccEmail?.trim();
  const answers = body.answers ?? {};
  const findings = Array.isArray(body.findings) ? body.findings : [];

  if (!recipientEmail) {
    return NextResponse.json({ error: 'Recipient email is required.' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        error: 'RESEND_API_KEY is not configured. Set it in your environment to send emails.',
      },
      { status: 500 }
    );
  }

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
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Retirement Check-Up <onboarding@resend.dev>',
      to: [recipientEmail],
      cc: ccEmail ? [ccEmail] : undefined,
      subject: 'Retirement questionnaire results',
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: 'retirement-questionnaire-results.csv',
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
