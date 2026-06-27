# Implementation Plan: Retirement Questionnaire App

A responsive, highly intuitive 10-question retirement "check-up" application designed for pre-retirees (ages 59–65) to diagnose critical deadlines, penalties, and tax planning opportunities. It will generate a color-coded attention report and email the results to `pgherity@gmail.com`.

## User Review Required

> [!IMPORTANT]
> **Email Delivery Setup**: The app will use an API route to send questionnaire results to `pgherity@gmail.com` using the **Resend** API. To enable sending in production, a `RESEND_API_KEY` environment variable must be added to Vercel. In development, we can test using Resend's free sandbox domain, which sends emails to the account owner.
> 
> **Package Manager**: As requested, we will use **Yarn** (v4.15.0) to manage all dependencies.

## Open Questions

> [!NOTE]
> None at the moment. Design and question structures are outlined below. Please review and approve this plan to begin execution.

---

## Proposed Changes

We will build a Next.js (App Router) + TypeScript project with Vanilla CSS.

### Project Initialization

We will bootstrap a Next.js App Router project in `/Users/dryga/dev/retirement-questionnarie` with Yarn, including ESLint and TypeScript, but excluding Tailwind CSS (to follow our Vanilla CSS guidelines for rich, custom styling).

#### [NEW] Next.js Structure
The project will be initialized in the current directory, producing a standard Next.js workspace:
* `package.json`
* `src/app/page.tsx` (Main Questionnaire Page)
* `src/app/layout.tsx` (Global layout & fonts)
* `src/app/api/submit/route.ts` (API route for sending email reports)
* `src/app/globals.css` (Design tokens, glassmorphism styles, print styles)
* `src/components/Questionnaire.tsx` (Questionnaire state machine & UI)
* `src/components/ReportView.tsx` (Color-coded result diagnostic report)

---

### Design System & Aesthetics

For the 59–65 age group, we need a high-end interface that is clean, clear, and readable:
* **Typography**: Outfits / Inter with high contrast and legible sizing (minimum 16px body, 18px-24px for questions).
* **Colors**: Curated, warm palette (Sleek slate-900 background, indigo-600/emerald-500 accent colors).
* **Glassmorphism**: Translucent cards (`backdrop-filter: blur(12px)`) with subtle borders for a premium, lightweight look.
* **Micro-animations**: Smooth transitions between questions, progress indicators, and hover states.
* **Accessibility**: Large click targets, clear keyboard focus states, high-contrast text, and simple inputs.

---

### Questionnaire Logic (10 Questions)

| # | Question Title | Options | Diagnosis Logic | Attention Level |
|---|---|---|---|---|
| **1** | **What is your age?** | Number input / Slider (50–75) | Base question to calculate ages relative to milestones (59.5, 62, 65, 67, 73). | Info / Green |
| **2** | **Do you have active company retirement accounts (401k/403b)?** | - Yes, current employer<br>- Yes, former employer<br>- No | If age ≥ 59.5 and Yes: In-service rollover/consolidation is available to move to an IRA. | **Yellow** (Opportunity) |
| **3** | **Are you currently contributing to a Health Savings Account (HSA)?** | - Yes<br>- No | If age ≥ 65 and Yes: Tax penalties apply once enrolled in Medicare. Must stop HSA contributions 6 months prior. | **Red** (Penalty Risk) |
| **4** | **What is your plan for Medicare enrollment?** | - Enroll right at age 65<br>- Enroll later (have employer coverage)<br>- No set plan / Unsure | If age ≥ 65 and No/Unsure: Lifetime late-enrollment penalties (10%/yr for Part B) unless creditable employer coverage exists. | **Red** (Penalty Risk) |
| **5** | **Are you evaluating Roth conversions?** | - Yes, already doing them<br>- Interested but haven't started<br>- No / Don't know what they are | If "Interested" or "No/Don't know": Recommend Roth conversions during low-income years before Social Security starts. | **Yellow** (Opportunity) |
| **6** | **When do you plan to claim Social Security?** | - Age 62 (as early as possible)<br>- Full Retirement Age (66-67)<br>- Age 70 (maximum benefit)<br>- Unsure | If Age 62: permanent reduction of benefits by up to 30%. If Unsure: needs review. | **Yellow** (Action Needed) |
| **7** | **How will you cover healthcare before age 65 if you retire early?** | - Working until 65+<br>- ACA / COBRA / Spouse's plan<br>- No concrete plan yet<br>- Already 65+ | If age < 65 and "No concrete plan yet": Immediate health coverage gap risk. | **Red** (Critical Gap) |
| **8** | **Do you have a cash buffer for retirement?** | - Yes (1-2 years of expenses)<br>- No, mostly invested in stocks<br>- Unsure | If No/Unsure: High risk of "sequence of returns risk" (selling assets during a downturn). | **Yellow** (Risk Mitigation) |
| **9** | **Do you know when your Required Minimum Distributions (RMDs) start?** | - Yes, I understand RMDs<br>- No, unsure | If No: 25% tax penalty on missed distributions (starts age 73 or 75). | **Yellow** (Penalty Risk) |
| **10** | **Have you evaluated your state's retirement tax friendliness?** | - Yes, fully researched<br>- No, not yet | If No: Recommend checking tax exemptions on SS, pensions, and retirement withdrawals. | **Yellow** (Opportunity) |

---

### Diagnostic Report Generation

The results screen will display findings grouped into:
1.  🔴 **Action Required / Critical Alerts** (High priority: penalties, health gaps, HSA violation).
2.  🟡 **Planning Opportunities / Actions Needed** (Medium priority: Roth conversion, Social Security claiming strategy, in-service rollover, RMD planning).
3.  🟢 **On Track** (Low priority: items where the user is already prepared).

---

### Email Submission (API Route)

An API route `src/app/api/submit/route.ts` will receive the client answers and diagnosis, format it into a professional email report, and send it to:
- Primary: `pgherity@gmail.com`
- CC/BCC: Optional email entered by the user.
We will construct an HTML email template with color blocks matching the diagnosis.

---

## Verification Plan

### Automated Tests
- Run `yarn build` to ensure the TypeScript compiling and production build succeeds.
- Validate that Next.js API route compiles.

### Manual Verification
- Test client side validation, sliders, and progress steps.
- Test questionnaire flow and verify the generated diagnostic report.
- Verify API submission triggers email delivery (with mock or sandbox API keys).
- Verify responsive layout across Desktop, Tablet, and Mobile displays.
