# BLOOM 2.0 — Setup Guide
> Get from demo shell → fully working backend in ~20 minutes

---

## What You'll Need
- A free [Supabase](https://supabase.com) account
- A free [Google AI Studio](https://aistudio.google.com) API key (for Gemini)
- [Node.js 18+](https://nodejs.org)

---

## Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `bloom-production`), set a strong DB password, pick a region close to your users
3. Wait ~2 minutes for the project to spin up
4. Go to **Project Settings → API**
5. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon / public key** (starts with `eyJ...`)

---

## Step 2 — Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor → New query**
2. Copy the entire contents of `supabase/migrations/001_bloom_schema.sql`
3. Paste it into the editor and click **Run**
4. You should see "Success. No rows returned." — all 6 tables are created with RLS enabled

---

## Step 3 — Configure the Frontend

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```bash
# In c:\Users\Maurya Jain\Documents\bloom\bloom2.0\
copy .env.local.example .env.local
```

Then edit `.env.local` with your real values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

---

## Step 4 — Get a Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with a Google account
3. Click **Get API key → Create API key**
4. Copy the key (starts with `AIza...`)

> ⚠️ **Never** put this key in `.env.local` — it would be exposed in the browser bundle.
> It goes into Supabase Edge Function secrets (Step 5).

---

## Step 5 — Deploy the Ask Bloom Edge Function

Install the Supabase CLI:

```bash
npm install -g supabase
```

Login and link to your project:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```
*(Your project ref is the part of your URL: `https://YOUR_PROJECT_REF.supabase.co`)*

Set the Gemini API key as a secret:

```bash
npx supabase secrets set GEMINI_API_KEY=AIza...your-gemini-key...
```

Deploy the Edge Function:

```bash
npx supabase functions deploy ask-bloom
```

You should see: `Deployed Function ask-bloom` ✅

---

## Step 6 — Enable Email Auth in Supabase

1. In Supabase dashboard → **Authentication → Providers**
2. Ensure **Email** provider is enabled (it is by default)
3. For a hackathon demo, you can disable email confirmation:
   - Go to **Authentication → Email Templates**
   - Or: **Authentication → Providers → Email → Disable email confirmations** (for testing)

---

## Step 7 — Run the App

```bash
cd "c:\Users\Maurya Jain\Documents\bloom\bloom2.0"
npm run dev
```

Visit `http://localhost:5174/bloom2.0/`

---

## Verification Checklist

After setup, test these in order:

- [ ] Click **Sign Up** → create an account → lands on onboarding Step 1
- [ ] Complete all 6 onboarding steps → see "Your Bloom is ready" screen → click Enter Bloom
- [ ] In Supabase SQL Editor, run: `SELECT * FROM user_profiles;` → your row should be there
- [ ] Ask Bloom a question → response is personalised with your name and symptoms
- [ ] Refresh the page → still logged in (session persists)
- [ ] Click **Try Demo** → Sarah or Priya loads without auth
- [ ] Type "I'm having chest pain" in Ask Bloom → emergency redirect appears immediately

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

> ⚠️ Your `.env.local` values are baked into the build bundle. This is fine for the Supabase **anon key** (it's designed to be public + protected by RLS). Never add `GEMINI_API_KEY` to `.env.local`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase credentials not found" warning on load | Create `.env.local` (Step 3) and restart `npm run dev` |
| Ask Bloom shows "Demo mode" even after login | Edge Function not deployed — complete Step 5 |
| Sign up error "User already registered" | Use a different email, or disable email confirmation in Supabase Auth settings |
| Build error: Cannot find module | Run `npm install` in the project root |
| Edge Function 401 error | The JWT is not being passed — check browser console for auth state |

---

*Built for BLOOM · Team Voldemort · AI4India · HopeWorks Hackathon 2025*
