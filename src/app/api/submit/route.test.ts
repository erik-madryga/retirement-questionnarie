import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('submit API route', () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
    delete process.env.REPORT_RECIPIENT_EMAIL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns a success response when email sending is skipped because no API key is configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: 'jane@example.com',
        answers: { age: 62 },
        findings: [],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.message).toContain('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses the configured recipient email and the submitted email as cc', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('ok'),
    });
    vi.stubGlobal('fetch', fetchMock);
    process.env.RESEND_API_KEY = 'test-key';
    process.env.REPORT_RECIPIENT_EMAIL = 'office@example.com';

    const request = new Request('http://localhost/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phoneNumber: '555-0100',
          age: 62,
        },
        findings: [],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init.body as string);

    expect(payload.to).toEqual(['office@example.com']);
    expect(payload.cc).toEqual(['jane@example.com']);
  });

  it('includes contact information in the email subject and body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('ok'),
    });
    vi.stubGlobal('fetch', fetchMock);
    process.env.RESEND_API_KEY = 'test-key';
    process.env.REPORT_RECIPIENT_EMAIL = 'office@example.com';

    const request = new Request('http://localhost/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: 'jane@example.com',
        answers: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phoneNumber: '555-0100',
          age: 62,
        },
        findings: [],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init.body as string);

    expect(payload.subject).toBe('Retirement questionnaire results for Jane Doe');
    expect(payload.text).toContain('First Name: Jane');
    expect(payload.text).toContain('Last Name: Doe');
    expect(payload.text).toContain('Email: jane@example.com');
    expect(payload.text).toContain('Phone Number: 555-0100');
  });
});
