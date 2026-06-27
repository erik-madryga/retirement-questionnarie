'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';

export interface AnswerState {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  age: number;
  companyPlan: string;
  hsaContrib: string;
  medicarePlan: string;
  rothConversions: string;
  socialSecurity: string;
  pre65Health: string;
  cashBuffer: string;
  rmdKnowledge: string;
  stateTaxCheck: string;
}

interface QuestionnaireProps {
  onComplete: (answers: AnswerState) => void;
}

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<AnswerState>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    age: 59,
    companyPlan: '',
    hsaContrib: '',
    medicarePlan: '',
    rothConversions: '',
    socialSecurity: '',
    pre65Health: '',
    cashBuffer: '',
    rmdKnowledge: '',
    stateTaxCheck: '',
  });

  const totalSteps = 11;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const updateAnswer = (key: keyof AnswerState, value: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const isValidEmail = (value: string) => /.+@.+\..+/.test(value.trim());

  const isValidPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const getContactValidation = () => {
    const errors: Record<string, string> = {};

    if (!answers.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }

    if (!answers.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }

    if (!answers.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (!isValidPhoneNumber(answers.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number.';
    }

    if (!answers.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(answers.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    return errors;
  };

  // Check if current step is answered to enable Next button
  const isStepValid = () => {
    switch (step) {
      case 1:
        return Object.keys(getContactValidation()).length === 0;
      case 2:
        return answers.age >= 50 && answers.age <= 75;
      case 3:
        return answers.companyPlan !== '';
      case 4:
        return answers.hsaContrib !== '';
      case 5:
        return answers.medicarePlan !== '';
      case 6:
        return answers.rothConversions !== '';
      case 7:
        return answers.socialSecurity !== '';
      case 8:
        return answers.pre65Health !== '';
      case 9:
        return answers.cashBuffer !== '';
      case 10:
        return answers.rmdKnowledge !== '';
      case 11:
        return answers.stateTaxCheck !== '';
      default:
        return false;
    }
  };

  const contactErrors = getContactValidation();

  // Progress percentage
  const progressPercent = Math.round(((step - 1) / totalSteps) * 100);

  return (
    <div className="glass-panel fade-in" style={{ padding: '40px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      {/* Progress Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            CHECK-UP PROGRESS
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-indigo)', fontWeight: 600 }}>
            Step {step} of {totalSteps} ({progressPercent}%)
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'var(--color-indigo)', 
              borderRadius: '3px',
              transition: 'width var(--transition-smooth)'
            }} 
          />
        </div>
      </div>

      {/* Question Content */}
      <div style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {step === 1 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldCheck size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>CONTACT DETAILS</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              Tell us who you are before we review your retirement plan.
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              We’ll use this to personalize your report and send the diagnosis to the right email address.
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  value={answers.firstName}
                  onChange={(e) => updateAnswer('firstName', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: contactErrors.firstName ? '1px solid var(--color-red)' : '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)' }}
                />
                {contactErrors.firstName ? <p style={{ color: 'var(--color-red)', marginTop: '6px', fontSize: '0.9rem' }}>{contactErrors.firstName}</p> : null}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={answers.lastName}
                  onChange={(e) => updateAnswer('lastName', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: contactErrors.lastName ? '1px solid var(--color-red)' : '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)' }}
                />
                {contactErrors.lastName ? <p style={{ color: 'var(--color-red)', marginTop: '6px', fontSize: '0.9rem' }}>{contactErrors.lastName}</p> : null}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={answers.phoneNumber}
                  onChange={(e) => updateAnswer('phoneNumber', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: contactErrors.phoneNumber ? '1px solid var(--color-red)' : '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)' }}
                />
                {contactErrors.phoneNumber ? <p style={{ color: 'var(--color-red)', marginTop: '6px', fontSize: '0.9rem' }}>{contactErrors.phoneNumber}</p> : null}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={answers.email}
                  onChange={(e) => updateAnswer('email', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: contactErrors.email ? '1px solid var(--color-red)' : '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)' }}
                />
                {contactErrors.email ? <p style={{ color: 'var(--color-red)', marginTop: '6px', fontSize: '0.9rem' }}>{contactErrors.email}</p> : null}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Calendar size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>MILESTONE AGE</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              What is your current age?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1rem', lineHeight: '1.5' }}>
              Retirement deadlines, penalties, and tax rules are strictly tied to key milestone ages.
            </p>
            <div className="custom-slider-container">
              <div className="slider-value-display">{answers.age}</div>
              <input 
                type="range" 
                min="50" 
                max="75" 
                value={answers.age} 
                onChange={(e) => updateAnswer('age', parseInt(e.target.value))}
                className="custom-slider"
                aria-label="Current Age"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Age 50</span>
                <span>Age 62 (Early SS)</span>
                <span>Age 65 (Medicare)</span>
                <span>Age 75</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldCheck size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>EMPLOYER ACCOUNTS</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              Do you have retirement accounts sitting with an employer?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              Consolidating or rolling over former plans can lower fees and open up tax planning options.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.companyPlan === 'current' ? 'active' : ''}`}
                onClick={() => updateAnswer('companyPlan', 'current')}
              >
                <div className="option-circle" />
                <span>Yes, with my current employer</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.companyPlan === 'former' ? 'active' : ''}`}
                onClick={() => updateAnswer('companyPlan', 'former')}
              >
                <div className="option-circle" />
                <span>Yes, left at a former employer</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.companyPlan === 'no' ? 'active' : ''}`}
                onClick={() => updateAnswer('companyPlan', 'no')}
              >
                <div className="option-circle" />
                <span>No company plans (only IRAs or personal savings)</span>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <HelpCircle size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>HEALTH SAVINGS ACCOUNT</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              Are you currently contributing to a Health Savings Account (HSA)?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              HSAs are double tax-advantaged, but there are strict rules as you approach Medicare age.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.hsaContrib === 'yes' ? 'active' : ''}`}
                onClick={() => updateAnswer('hsaContrib', 'yes')}
              >
                <div className="option-circle" />
                <span>Yes, I contribute to an HSA</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.hsaContrib === 'no' ? 'active' : ''}`}
                onClick={() => updateAnswer('hsaContrib', 'no')}
              >
                <div className="option-circle" />
                <span>No, I do not contribute to an HSA</span>
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Calendar size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>MEDICARE ENROLLMENT</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              What is your current plan for Medicare enrollment?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              Failing to enroll when first eligible can trigger lifelong premium penalties.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.medicarePlan === 'age65' ? 'active' : ''}`}
                onClick={() => updateAnswer('medicarePlan', 'age65')}
              >
                <div className="option-circle" />
                <span>I plan to enroll right at age 65</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.medicarePlan === 'later' ? 'active' : ''}`}
                onClick={() => updateAnswer('medicarePlan', 'later')}
              >
                <div className="option-circle" />
                <span>I will enroll later (covered by active employment plan)</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.medicarePlan === 'unsure' ? 'active' : ''}`}
                onClick={() => updateAnswer('medicarePlan', 'unsure')}
              >
                <div className="option-circle" />
                <span>I don't have a plan yet / I am unsure</span>
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldCheck size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>TAX CONVERSIONS</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              Are you currently evaluating or performing Roth conversions?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              Moving pre-tax retirement funds into tax-free Roth accounts can protect you from rising future tax rates.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.rothConversions === 'yes' ? 'active' : ''}`}
                onClick={() => updateAnswer('rothConversions', 'yes')}
              >
                <div className="option-circle" />
                <span>Yes, I am actively converting or have a plan</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.rothConversions === 'interested' ? 'active' : ''}`}
                onClick={() => updateAnswer('rothConversions', 'interested')}
              >
                <div className="option-circle" />
                <span>I am interested, but don't know the rules/process</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.rothConversions === 'no' ? 'active' : ''}`}
                onClick={() => updateAnswer('rothConversions', 'no')}
              >
                <div className="option-circle" />
                <span>No, I am not considering Roth conversions</span>
              </button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Calendar size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>SOCIAL SECURITY</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              When do you plan to start claiming Social Security benefits?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              Claiming early decreases monthly payouts permanently. Delaying past Full Retirement Age increases it.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.socialSecurity === '62' ? 'active' : ''}`}
                onClick={() => updateAnswer('socialSecurity', '62')}
              >
                <div className="option-circle" />
                <span>Age 62 (Reduced benefits, claiming as early as possible)</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.socialSecurity === 'fra' ? 'active' : ''}`}
                onClick={() => updateAnswer('socialSecurity', 'fra')}
              >
                <div className="option-circle" />
                <span>Full Retirement Age (Age 66 or 67, 100% of benefit)</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.socialSecurity === '70' ? 'active' : ''}`}
                onClick={() => updateAnswer('socialSecurity', '70')}
              >
                <div className="option-circle" />
                <span>Age 70 (Maximum benefits, guaranteed 8% annual increase)</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.socialSecurity === 'unsure' ? 'active' : ''}`}
                onClick={() => updateAnswer('socialSecurity', 'unsure')}
              >
                <div className="option-circle" />
                <span>I am unsure of when I should claim</span>
              </button>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <HelpCircle size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>PRE-65 HEALTHCARE</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              If you retire before 65, how will you cover healthcare costs?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              Medicare starts at 65. If you retire early, coverage gaps can lead to severe financial risks.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.pre65Health === 'working' ? 'active' : ''}`}
                onClick={() => updateAnswer('pre65Health', 'working')}
              >
                <div className="option-circle" />
                <span>I will continue working until age 65 or later</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.pre65Health === 'aca' ? 'active' : ''}`}
                onClick={() => updateAnswer('pre65Health', 'aca')}
              >
                <div className="option-circle" />
                <span>I have a coverage plan (COBRA, ACA, or Spouse plan)</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.pre65Health === 'noplan' ? 'active' : ''}`}
                onClick={() => updateAnswer('pre65Health', 'noplan')}
              >
                <div className="option-circle" />
                <span>I do not have a concrete plan yet</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.pre65Health === 'over65' ? 'active' : ''}`}
                onClick={() => updateAnswer('pre65Health', 'over65')}
              >
                <div className="option-circle" />
                <span>I am already 65 or older (Medicare-eligible)</span>
              </button>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldCheck size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>CASH BUFFER</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              Do you have a designated cash buffer (e.g., 1-2 years of expenses)?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              This helps avoid selling stock investments at a loss if the market drops early in your retirement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.cashBuffer === 'yes' ? 'active' : ''}`}
                onClick={() => updateAnswer('cashBuffer', 'yes')}
              >
                <div className="option-circle" />
                <span>Yes, I have an adequate cash reserve</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.cashBuffer === 'no' ? 'active' : ''}`}
                onClick={() => updateAnswer('cashBuffer', 'no')}
              >
                <div className="option-circle" />
                <span>No, my assets are almost fully invested in equities</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.cashBuffer === 'unsure' ? 'active' : ''}`}
                onClick={() => updateAnswer('cashBuffer', 'unsure')}
              >
                <div className="option-circle" />
                <span>I am unsure how much cash I should keep aside</span>
              </button>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Calendar size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>TAX DISTRIBUTIONS</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              Do you know when your Required Minimum Distributions (RMDs) start?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              Traditional IRA/401(k) plans require you to withdraw funds starting at age 73 or 75. Penalties for missing these are high.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.rmdKnowledge === 'yes' ? 'active' : ''}`}
                onClick={() => updateAnswer('rmdKnowledge', 'yes')}
              >
                <div className="option-circle" />
                <span>Yes, I understand when and how to take RMDs</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.rmdKnowledge === 'no' ? 'active' : ''}`}
                onClick={() => updateAnswer('rmdKnowledge', 'no')}
              >
                <div className="option-circle" />
                <span>No, I am unsure of the rules or start ages</span>
              </button>
            </div>
          </div>
        )}

        {step === 11 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldCheck size={24} style={{ color: 'var(--color-indigo)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>STATE TAX PLANNING</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '12px', lineHeight: '1.3' }}>
              Have you evaluated state-specific retirement tax friendliness?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.5' }}>
              Different states have unique laws taxing pensions, Social Security, and pre-tax retirement accounts.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={`option-button ${answers.stateTaxCheck === 'yes' ? 'active' : ''}`}
                onClick={() => updateAnswer('stateTaxCheck', 'yes')}
              >
                <div className="option-circle" />
                <span>Yes, I have researched and know my state's tax rules</span>
              </button>
              <button 
                type="button" 
                className={`option-button ${answers.stateTaxCheck === 'no' ? 'active' : ''}`}
                onClick={() => updateAnswer('stateTaxCheck', 'no')}
              >
                <div className="option-circle" />
                <span>No, I haven't evaluated my state's tax policy yet</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '40px' }}>
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          style={{
            padding: '16px 28px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            color: step === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: step === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-sans)',
          }}
          className="no-print"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid()}
          style={{
            padding: '16px 36px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: isStepValid() ? 'var(--color-indigo)' : 'rgba(99, 102, 241, 0.2)',
            color: isStepValid() ? '#ffffff' : 'rgba(255,255,255,0.3)',
            fontSize: '1.05rem',
            fontWeight: 600,
            cursor: isStepValid() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-sans)',
            boxShadow: isStepValid() ? '0 4px 14px 0 rgba(99, 102, 241, 0.4)' : 'none',
          }}
          className="no-print"
        >
          {step === totalSteps ? 'See Diagnosis' : 'Next Question'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
