import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Questionnaire from './Questionnaire';
import ReportView from './ReportView';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Questionnaire', () => {
  it('requires valid contact information before moving forward', async () => {
    const user = userEvent.setup();
    render(<Questionnaire onComplete={vi.fn()} />);

    expect(screen.getByText(/Tell us who you are/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/First name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/Last name/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/Phone number/i), 'abc');
    await user.type(screen.getByPlaceholderText(/Email address/i), 'invalid');

    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('allows progression once contact details are valid', async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();
    render(<Questionnaire onComplete={handleComplete} />);

    await user.type(screen.getByPlaceholderText(/First name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/Last name/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/Phone number/i), '5551234567');
    await user.type(screen.getByPlaceholderText(/Email address/i), 'jane@example.com');

    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    expect(screen.getByText(/What is your current age/i)).toBeInTheDocument();
  });

  it('completes the questionnaire and calls onComplete with answers', async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();
    render(<Questionnaire onComplete={handleComplete} />);

    await user.type(screen.getByPlaceholderText(/First name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/Last name/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/Phone number/i), '5551234567');
    await user.type(screen.getByPlaceholderText(/Email address/i), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    const ageSlider = screen.getByLabelText(/Current Age/i);
    fireEvent.change(ageSlider, { target: { value: '62' } });

    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /Yes, with my current employer/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /Yes, I contribute to an HSA/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /I plan to enroll right at age 65/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /Yes, I am actively converting or have a plan/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /Full Retirement Age/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /I will continue working until age 65 or later/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /Yes, I have an adequate cash reserve/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /Yes, I understand when and how to take RMDs/i }));
    await user.click(screen.getByRole('button', { name: /Next Question/i }));

    await user.click(screen.getByRole('button', { name: /Yes, I have researched and know my state's tax rules/i }));
    await user.click(screen.getByRole('button', { name: /See Diagnosis/i }));

    expect(handleComplete).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '5551234567',
      email: 'jane@example.com',
    }));
  });

  it('renders a submission status message after sending the report', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const onRestart = vi.fn();
    render(<ReportView answers={{
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '5551234567',
      email: 'jane@example.com',
      age: 62,
      companyPlan: 'current',
      hsaContrib: 'no',
      medicarePlan: 'age65',
      rothConversions: 'interested',
      socialSecurity: '62',
      pre65Health: 'working',
      cashBuffer: 'yes',
      rmdKnowledge: 'no',
      stateTaxCheck: 'no',
    }} onRestart={onRestart} />);

    const recipientInput = screen.getByPlaceholderText(/Send to email/i);
    await userEvent.type(recipientInput, 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /Send report/i }));

    expect(fetchMock).toHaveBeenCalled();
    expect(await screen.findByText(/Report sent successfully/i)).toBeInTheDocument();
  });
});
