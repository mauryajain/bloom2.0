<div align="center">

<img src="public/bloom.svg" alt="Bloom Logo" width="80" />

# BLOOM

### A Holistic Women's Health Companion

**"It's not in your head. Here's the data."**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?style=flat-square&logo=google)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

[Live Demo](https://ambharat314.github.io/bloom2.0/#/) · [Setup Guide](#setup) · [Features](#features) · [Tech Stack](#tech-stack)

</div>

---
LIVE DEMO LINK: https://ambharat314.github.io/bloom2.0/#/

## The Problem

Women's health has been chronically understudied, underfunded, and undertreated for decades.

- Before 1993, women were excluded from most clinical trials — creating diagnostic criteria built on male patient data
- Endometriosis takes **7–10 years** to diagnose on average
- PCOS affects 1 in 10 women, yet **50% go undiagnosed**
- Women are **50% more likely** to be misdiagnosed after a heart attack
- The average doctor's appointment is **7 minutes** — not enough time to communicate years of cyclical, multisystem symptoms

Women navigate their health with fragmented, contradictory information and no structured way to document their experience. Without longitudinal tracking, patterns that could unlock a diagnosis remain invisible for years.

**Bloom exists to change that.**

---

## What is Bloom?

Bloom is an AI-powered holistic women's health companion that tracks symptoms over time, detects patterns, and helps women walk into doctor appointments prepared, informed, and heard.

It covers every stage of life — from menarche to post-menopause — and is built specifically for the experiences that mainstream health tools ignore: cyclical pain, hormonal shifts, medical dismissal, and the 7-year silence before a diagnosis.

> Bloom is **not** a diagnostic tool. It is an information, advocacy, and pattern-tracking tool. Every AI output is framed as "here's what the data shows — here's how to discuss it with your doctor."

---

## Features

### 🗺️ My Journey — The Life Timeline
An interactive visual roadmap of all 7 life stages rendered as a road you travel through. Your current stage is marked with a glowing pin. Tap any stage — past, present, or future — to explore body changes, body signals, relationship and intimacy notes, symptoms to watch, and care guidance specific to that chapter. Future stages show a warm note: *"You're not here yet — but knowing what's ahead helps you prepare."*

Life stages covered:
- **Puberty** (8–17) · **Reproductive Years** (18–39) · **Pregnancy** · **Postpartum** (0–12 months)
- **Perimenopause** (~40–55) · **Menopause** (~45–58) · **Post-Menopause** (55+)

---

### 📓 Symptom Journal
Daily logging with zero friction. Log symptoms from 18 presets (cramps, pelvic pain, brain fog, hot flashes, and more), set severity on a 1–5 scale, record mood from 8 options, energy (1–10), sleep hours, and free-text notes. The last 30 entries are displayed in a collapsible history view.

---

### 🎙️ Voice Symptom Logger
Say *"I've had really bad cramps today, my energy is about a 3, and I didn't sleep well"* and Bloom extracts and logs it automatically. Uses the Web Speech API for transcription and Gemini AI to parse the transcript into structured symptom, mood, energy, and sleep data — which you can review before saving.

---

### 🤖 Ask Bloom — AI Health Guide
A conversational AI assistant built on Gemini 1.5 Flash, system-prompted with the user's full profile: name, age, life stage, diagnosed conditions, family history, goals, communication style preference, and minor-safe mode for users under 18. Ask Bloom answers questions with reference to your specific data, cites research, and always concludes with *"Questions to ask your doctor."* It never diagnoses — it frames every response as pattern observation and conversation preparation.

Real-time symptom trend mini-chart and noticeable patterns are surfaced above the chat input as context. Ask Bloom also supports live voice chat: users can speak questions through the browser microphone and optionally hear spoken AI replies.

---

### ☁️ Body Forecast
A 7-day predictive forecast of your upcoming week, generated from your 90-day symptom history using Gemini AI. Each day shows predicted symptoms with probability percentages, an energy prediction bar, a risk level (low / moderate / high / severe), and a one-line recommendation. An overall weekly warning and a set of key recommendations for the week are generated alongside the day-by-day view.

---

### 📋 Doctor Visit Prep Report
Generated automatically after 21 days of symptom logs, and refreshed every 15 days. The report includes:
- A plain-language summary of your tracked period
- Your top 5 symptoms ranked by frequency and average severity, visualized as a bar chart
- AI-detected patterns and the conditions they may be consistent with
- A timeline of notable recent entries
- Cycle data summary
- 4 targeted questions to ask your healthcare provider
- Print/export to PDF

---

### 💌 Monthly Bloom Letter
A personalized AI-written monthly brief generated from your actual data — symptom counts, top symptoms, average severity, energy, sleep, detected patterns, goals, and doctor-prep questions. Delivered as a warm 3-paragraph letter: what your body has been doing, one pattern worth noting, and an encouraging insight about your life stage. Downloadable as a `.txt` file. Cached monthly so it's always available. Falls back to a locally-generated letter if Gemini is unavailable.

---

### ✅ What's Normal? Guide
A two-column reference guide showing what's *usually normal* vs. what's *worth mentioning to a doctor* — tailored to your current life stage. Includes a stage explorer dropdown so you can read ahead to any stage of life. Covers all 7 life stages with research-informed content.

---

### 📚 Condition Library
A medically-referenced library of 22+ conditions that disproportionately affect women. Each entry includes:
- Plain-language description and prevalence
- Common symptoms, related conditions, common misdiagnoses
- Average diagnosis timeline
- Which life stages are most affected
- When to see a doctor
- Research references (WHO, ACOG, NHS)

Filterable by: all conditions, your diagnosed conditions, life-stage-relevant conditions, and symptom-matched conditions based on your onboarding data.

---

### 🌸 Stage Entry Guide
A 3-step introductory carousel that auto-launches the first time a user enters any life stage. Each step has a warm title, a short body, and an illustrative emoji. Content is written specifically for each of the 7 life stages — covering what to expect, how Bloom will help, and a grounding message. Shows once per stage, never repeats.

---

### 📊 Dashboard
At-a-glance health overview with:
- 4 live stat cards (Days Tracked, Avg Severity, Patterns Found, Avg Energy)
- Life-stage adaptive banner personalized to your current stage and its colors
- Unread pattern alerts with confidence scores and flagged conditions
- 30-day symptom severity + energy area chart
- Symptom category radar chart
- Top 6 symptoms bar chart (last 30 days)
- Today's snapshot (symptoms, mood, energy, sleep)
- Monthly Bloom Letter card
- 7-day Body Forecast card

---

### ⚙️ Settings
Manage profile, notification preferences, data sharing, and life-stage-adaptive theme. Sign out cleanly with session clearing.

---

## AI Architecture

Bloom uses a layered AI approach:

```
User Input
    │
    ▼
Emergency Keyword Detection (client-side, instant)
    │ ─── Emergency found ──▶ Redirect to emergency services (102/112/911/999)
    │
    ▼
Gemini 1.5 Flash (VITE_GEMINI_API_KEY, direct frontend call)
    │  System prompt built from full UserProfile via buildSystemPrompt()
    │  Includes: name, age, life stage, symptoms, conditions, family history,
    │            goals, communication style, minor-safe mode, urgency flag
    │
    ├── AskBloom chat responses
    ├── Voice transcript → structured symptom extraction
    ├── 7-day Body Forecast generation
    └── Monthly Bloom Letter generation
    │
    ▼
Fallback: Supabase Edge Function (ask-bloom)
    │  Server-side call, uses session token
    │
    ▼
Fallback: Locally-generated responses
    (demo mode or no credentials — never shows an empty screen)
```

**Pattern Detection Pipeline (client-side, no API required):**
1. Symptom logs stored with timestamp, cycle day, category, severity
2. Weekly analysis: frequency by symptom, average severity, co-occurrence
3. Patterns with avg severity ≥ 3.5 appearing ≥ 30% of tracked days trigger alerts
4. Alerts cross-referenced against the condition library for relevant matches
5. Confidence score calculated from frequency × severity / 5

**Safety guardrails:**
- Emergency keywords trigger instant redirect — no health info provided
- Minor safe mode activated for users under 18 — HRT, fertility, adult topics blocked
- No diagnosis language in any output — observational framing enforced in system prompt
- All pattern alerts state "worth discussing with your doctor" as the recommendation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| State Management | Zustand 5 (with `persist` middleware) |
| Routing | React Router DOM 7 |
| Charts | Recharts 3 |
| Animation | Framer Motion 12 |
| AI / ML | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Backend / Auth | Supabase (PostgreSQL + Auth + Row Level Security) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Date Utilities | date-fns 4 |
| Icons | Lucide React |
| PDF Export | @react-pdf/renderer |
| Speech-to-Text | Web Speech API (browser native) |
| Deployment | GitHub Pages |

---

## Project Structure

```
bloom2.0/
├── src/
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AskBloom.tsx          # Conversational AI chat
│   │   │   ├── BloomAvatar.tsx       # Animated AI avatar
│   │   │   └── DoctorPrep.tsx        # Doctor visit report
│   │   ├── conditions/
│   │   │   ├── ConditionLibrary.tsx  # 22+ condition reference
│   │   │   └── NormalVsNot.tsx       # What's normal guide
│   │   ├── dashboard/
│   │   │   ├── BloomLetter.tsx       # Monthly AI letter
│   │   │   ├── BodyForecast.tsx      # 7-day prediction
│   │   │   └── Dashboard.tsx         # Main overview
│   │   ├── layout/
│   │   │   ├── AppShell.tsx          # View router
│   │   │   └── Sidebar.tsx           # Navigation
│   │   ├── onboarding/
│   │   │   ├── LandingPage.tsx       # Auth + demo selector
│   │   │   ├── OnboardingFlow.tsx    # 6-step onboarding
│   │   │   ├── StageEntryGuide.tsx   # Life stage intro modal
│   │   │   └── steps/               # Steps 1–6
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   ├── symptoms/
│   │   │   ├── SymptomJournal.tsx    # Daily logging
│   │   │   └── VoiceSymptomLogger.tsx # Voice-to-log
│   │   └── timeline/
│   │       └── LifeTimeline.tsx      # Life journey map
│   ├── data/
│   │   ├── conditions.ts             # 22 condition entries
│   │   ├── demoData.ts               # 90-day demo profiles
│   │   ├── lifeStages.ts             # 7 life stage configs
│   │   ├── normalVsNot.ts            # Normal vs see doctor data
│   │   └── researchDatasets.ts       # Symptom research data
│   ├── hooks/
│   │   └── useVoiceJournal.ts        # Web Speech API hook
│   ├── lib/
│   │   ├── api.ts                    # Backend API client
│   │   ├── authService.ts            # Supabase auth helpers
│   │   ├── buildSystemPrompt.ts      # Personalized AI prompt builder
│   │   ├── onboardingService.ts      # Onboarding DB writes
│   │   └── supabase.ts               # Supabase client
│   ├── store/
│   │   └── useBloomStore.ts          # Zustand global store
│   ├── types/
│   │   └── index.ts                  # All TypeScript types
│   └── utils/
│       ├── aiEngine.ts               # Gemini + pattern detection
│       ├── bodyForecastEngine.ts     # 7-day forecast logic
│       └── voiceExtractor.ts         # Voice → structured data
├── bloom-backend/
│   └── src/
│       ├── routes/
│       │   ├── askbloom.js           # AI chat route
│       │   ├── auth.js               # Auth routes
│       │   ├── doctorprep.js         # Report generation
│       │   ├── logs.js               # Symptom log CRUD
│       │   └── patterns.js           # Pattern analysis
│       └── index.js                  # Express server
├── supabase/
│   ├── functions/ask-bloom/          # Edge function
│   └── migrations/                   # DB schema (SQL)
├── public/
└── .env.local.example
```

---

## Setup

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)

### 1. Clone and install

```bash
git clone https://github.com/ambharat314/bloom2.0.git
cd bloom2.0
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste the contents of `supabase/migrations/001_bloom_schema.sql`, and run it
3. Run `supabase/migrations/002_onboarding_profile_fields.sql` the same way
4. Go to **Project Settings → API** and copy your Project URL and anon key
5. Go to **Authentication → URL Configuration** and set:
   - **Site URL:** `https://ambharat314.github.io/bloom2.0/`
   - **Redirect URLs:** `https://ambharat314.github.io/bloom2.0/**`
   - Optional local dev redirect: `http://localhost:5173/**`
6. For hackathon/demo testing, go to **Authentication → Sign In / Providers → Email** and either:
   - keep email confirmation on, then confirm new accounts from the inbox before logging in
   - turn **Confirm email** off if you want test accounts to log in immediately

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional — enables direct Gemini AI calls from the frontend
# Without this, Bloom falls back to the Supabase Edge Function
VITE_GEMINI_API_KEY=your-gemini-key
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Try demo mode (no credentials needed)

On the landing page, click **Try Demo** to explore with pre-loaded 90-day profiles:
- **Mia** — Puberty
- **Sarah** — Reproductive years
- **Elena** — Pregnancy
- **Noor** — Postpartum
- **Priya** — Perimenopause
- **Grace** — Menopause
- **Lata** — Post-menopause

### Deploy

```bash
# GitHub Pages
npm run deploy

# Or build for any static host
npm run build
# dist/ folder is ready to serve
```

For the Node.js backend (optional):
```bash
cd bloom-backend
npm install
npm start
```

---

## Database Schema

Six tables, all with Row Level Security (users only access their own data):

| Table | Purpose |
|---|---|
| `users` | Extends Supabase `auth.users`, stores onboarding status |
| `user_profiles` | Full profile: life stage, cycle data, goals, preferences |
| `symptom_logs` | Daily logs with symptoms, mood, energy, sleep, notes |
| `patterns` | AI-detected pattern alerts |
| `conversations` | Ask Bloom chat history |
| `doctor_prep_reports` | Generated doctor visit reports |

---

## Who Bloom Is For

Bloom was designed around three real user archetypes:

**Priya, 28 — Marketing Manager, Mumbai**
6 years of undiagnosed PCOS. Seen 3 doctors who attributed everything to stress. Needs a system that tracks what doctors won't, and data she can walk into appointments with.

**Ananya, 47 — Senior HR Manager, Bangalore**
Perimenopause misdiagnosed as anxiety for 3 years. Prescribed antidepressants that didn't help. Needs guidance navigating a transition no one prepared her for.

**Riya, 16 — High school student, Delhi**
Debilitating period pain since menarche. Told it's normal. No baseline for what pain is a warning sign. Needs a safe, private space to learn and track.

---

## Design Principles

1. **Build for real humans, not hypothetical users** — every feature is designed around the lived experience of women navigating a system that dismisses them
2. **Start with real friction** — the 7-year endometriosis diagnosis wait is the friction Bloom eliminates
3. **Think beyond convenience** — Bloom serves women in pain, not just wellness enthusiasts
4. **Assume constraints** — short appointments, dismissed symptoms, no historical data; Bloom compensates for all three
5. **Design for simplicity, empathy, and dignity** — every feature is framed to empower, not alarm
6. **Never diagnose** — observational language only; every insight ends with "here's how to discuss this with your doctor"

---

## Anticipated Impact

| Metric | Target |
|---|---|
| Avg diagnosis delay addressed | 7–10 years |
| Conditions in library | 22+ |
| Life stages covered | 7 (menarche → post-menopause) |
| Architecture scales to | 100K users, no changes required |
| Most impacted persona | Priya — estimated 60–70% reduction in time spent connecting symptoms; 3× better appointment preparation |

---

## Safety & Privacy

- **No diagnosis language** — enforced at system prompt level and in post-processing
- **Emergency detection** — 20+ emergency keyword triggers instant redirect to emergency services (102/112 India, 911 USA, 999 UK, plus crisis lines for self-harm)
- **Minor safe mode** — users under 18 have HRT, fertility, and adult health topics automatically blocked
- **Row Level Security** — all Supabase tables have RLS policies; users can only access their own data
- **No third-party data sharing** — health data is not sold or shared; opt-in only for anonymized research contribution
- **Not marketed as a medical device** — clearly framed as an information and advocacy tool

---

## Built By

**Team Voldemort** — HopeWorks · AI4India · Hackathon 2025

| Maurya Jain |
| Manthan Sharma |
| Khushi Hirawat |
| Bharat Bhateja | 

---

## License

MIT © 2025 Team Voldemort

---

<div align="center">

*Every symptom logged is a vote for a world where women are believed.*

**BLOOM · Built for every woman, at every stage of her life**

</div>
