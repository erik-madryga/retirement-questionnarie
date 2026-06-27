'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Sparkles, RotateCcw, Send } from 'lucide-react';
import type { AnswerState } from './Questionnaire';

interface ReportViewProps {
  answers: AnswerState;
  onRestart: () => void;
}

type Severity = 'critical' | 'warning' | 'good';

interface Finding {
  severity: Severity;
  title: string;
  detail: string;
}

const severityStyles: Record<Severity, { border: string; background: string; iconColor: string; label: string }> = {
  critical: {
    border: 'rgba(244, 63, 94, 0.35)',
    background: 'rgba(244, 63, 94, 0.1)',
    iconColor: 'var(--color-red)',
    label: 'Action required',
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.35)',
    background: 'rgba(245, 158, 11, 0.1)',
    iconColor: 'var(--color-yellow)',
    label: 'Planning opportunity',
  },
  good: {
    border: 'rgba(16, 185, 129, 0.35)',
    background: 'rgba(16, 185, 129, 0.1)',
    iconColor: 'var(--color-green)',
    label: 'On track',
  },
};

export default function ReportView({ answers, onRestart }: ReportViewProps) {
  const [recipientEmail, setRecipientEmail] = useState(answers.email || '');
  const [ccEmail, setCcEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const findings: Finding[] = [];

  if (answers.age >= 65 && answers.hsaContrib === 'yes') {
    findings.push({
      severity: 'critical',
      title: 'HSA contribution timing',
      detail: 'You are over Medicare age and still contributing to an HSA, which can create avoidable tax complications.',
    });
  }

  if (answers.age >= 65 && answers.medicarePlan === 'unsure') {
    findings.push({
      severity: 'critical',
      title: 'Medicare enrollment risk',
      detail: 'A late enrollment decision can lead to lifelong premium penalties if you do not have credible employer coverage.',
    });
  }

  if (answers.pre65Health === 'noplan' && answers.age < 65) {
    findings.push({
      severity: 'critical',
      title: 'Healthcare gap before 65',
      detail: 'You have no clear pre-65 healthcare plan, which can create a major coverage gap if you retire early.',
    });
  }

  if (answers.socialSecurity === '62') {
    findings.push({
      severity: 'warning',
      title: 'Social Security claiming strategy',
      detail: 'Claiming at 62 permanently reduces monthly benefits, and a later start may be more efficient for many retirees.',
    });
  }

  if (answers.rothConversions === 'interested' || answers.rothConversions === 'no') {
    findings.push({
      severity: 'warning',
      title: 'Roth conversion planning',
      detail: 'A conversion conversation may be helpful, especially during lower-income years before Social Security starts.',
    });
  }

  if (answers.cashBuffer === 'no' || answers.cashBuffer === 'unsure') {
    findings.push({
      severity: 'warning',
      title: 'Cash reserve and sequence risk',
      detail: 'A cash buffer can reduce the chance of selling investments during a market downturn early in retirement.',
    });
  }

  if (answers.rmdKnowledge === 'no') {
    findings.push({
      severity: 'warning',
      title: 'RMD planning',
      detail: 'Understanding when RMDs begin matters because missed withdrawals can trigger significant penalties.',
    });
  }

  if (answers.companyPlan !== 'no') {
    findings.push({
      severity: 'warning',
      title: 'Employer plan review',
      detail: 'A former employer plan or active employer account may be worth consolidating or reviewing for fees and access options.',
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: 'good',
      title: 'You are broadly on track',
      detail: 'Your answers suggest you have already thought through the key retirement milestones and tax planning areas.',
    });
  }

  const groupedFindings = {
    critical: findings.filter((item) => item.severity === 'critical'),
    warning: findings.filter((item) => item.severity === 'warning'),
    good: findings.filter((item) => item.severity === 'good'),
  };

  const handleSubmit = async () => {
    const normalizedRecipient = recipientEmail.trim();
    const normalizedCc = ccEmail.trim();

    if (!normalizedRecipient || !/\S+@\S+\.\S+/.test(normalizedRecipient)) {
      setSubmitMessage('Please enter a valid recipient email address.');
      return;
    }

    if (normalizedCc && !/\S+@\S+\.\S+/.test(normalizedCc)) {
      setSubmitMessage('Please enter a valid CC email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          findings: findings.map((item) => ({
            title: item.title,
            detail: item.detail,
            severity: item.severity,
          })),
          recipientEmail: normalizedRecipient,
          ccEmail: normalizedCc,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to send report.');
      }

      setSubmitMessage('Report sent successfully.');
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : 'Unable to send report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '40px', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-indigo)', textTransform: 'uppercase' }}>
            Retirement diagnosis
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '8px' }}>
            Your retirement check-up summary
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
            These highlights are based on the answers you just provided and are meant to help guide your next planning steps.
          </p>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="no-print"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <RotateCcw size={18} />
          Retake check-up
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '20px', background: 'rgba(255,255,255,0.03)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Send this report</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Deliver the questionnaire results to an email address and include a CSV attachment that opens cleanly in Excel or Google Sheets.
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <input
              type="email"
              placeholder="Send to email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)' }}
            />
            <input
              type="email"
              placeholder="CC (optional)"
              value={ccEmail}
              onChange={(event) => setCcEmail(event.target.value)}
              style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)' }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !recipientEmail.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isSubmitting || !recipientEmail.trim() ? 'rgba(99, 102, 241, 0.25)' : 'var(--color-indigo)',
                color: '#fff',
                cursor: isSubmitting || !recipientEmail.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                boxShadow: isSubmitting || !recipientEmail.trim() ? 'none' : '0 8px 24px rgba(99, 102, 241, 0.28)',
              }}
            >
              <Send size={18} />
              {isSubmitting ? 'Sending…' : 'Send report'}
            </button>
            {submitMessage ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: submitMessage.includes('successfully') ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(244, 63, 94, 0.35)',
                  background: submitMessage.includes('successfully') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                  color: submitMessage.includes('successfully') ? 'var(--color-green)' : 'var(--color-red)',
                  fontWeight: 600,
                }}
              >
                {submitMessage}
              </div>
            ) : null}
          </div>
        </div>
        {(['critical', 'warning', 'good'] as Severity[]).map((section) => {
          const items = groupedFindings[section];
          if (items.length === 0) {
            return null;
          }

          return (
            <section
              key={section}
              style={{
                border: `1px solid ${severityStyles[section].border}`,
                background: severityStyles[section].background,
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                {section === 'critical' ? (
                  <AlertTriangle size={20} style={{ color: severityStyles[section].iconColor }} />
                ) : section === 'warning' ? (
                  <Sparkles size={20} style={{ color: severityStyles[section].iconColor }} />
                ) : (
                  <ShieldCheck size={20} style={{ color: severityStyles[section].iconColor }} />
                )}
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  {section === 'critical' ? 'Action required' : section === 'warning' ? 'Planning opportunities' : 'On track'}
                </h2>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {items.map((item) => (
                  <div key={item.title} style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                    <p style={{ fontWeight: 700, marginBottom: '4px' }}>{item.title}</p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
