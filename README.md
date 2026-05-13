# Chapter Agent

AI-powered 90-day engagement planning for fraternity and sorority chapter leaders.

## What It Does

- **Generates a full 90-day activity plan** — one wizard form produces 20–30 scheduled activities (emails, newsletters, social events, milestones) tailored to your chapter
- **Drafts content for every activity** — AI writes the email copy, newsletter text, event invitations, and milestone announcements for you
- **Manages your plan** — view a timeline, filter by type or status, edit details, mark activities complete or skipped, delete what you don't need
- **Syncs to Google Calendar** — push any activity directly to your Google Calendar with one click; edits and deletions stay in sync
- **Dashboard overview** — see your progress at a glance: activity counts by status and type, and a live feed of what's coming up this week

## Why I Built It

Chapter leaders spend hours each semester planning engagement campaigns from scratch. This project uses Claude AI to handle the repetitive planning and content-drafting work so leaders can focus on execution. It also demonstrates a full-stack Next.js 14 pattern: server-side auth, AI API integration with robust JSON parsing, and a Google OAuth + Calendar integration with automatic token refresh.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | SQLite (local dev) via Prisma ORM |
| Auth | NextAuth.js v4 — Google OAuth |
| AI | Anthropic Claude API (`claude-sonnet-4`) |
| Calendar | Google Calendar API v3 |
| Deployment target | Vercel + PostgreSQL (production) |

## Quick Start

```bash
git clone https://github.com/Umair-J/ChapterAgent.git
cd ChapterAgent
git checkout claude/save-chapter-agent-prd-33QQ9
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Dev Login** — no API keys or Google account needed to demo the full UI.

> **Note:** The app ships with `USE_MOCK_AI=true` in `.env`, which replaces live Anthropic API calls with realistic mock data. Live AI calls and Google Calendar sync are ready to enable — see [Enabling Live APIs](#enabling-live-apis) below.

## Usage

### 1 — Sign In
Click **Dev Login** on the login page. This creates a local test user instantly, no Google OAuth setup required.

### 2 — Generate a Plan
Go to **Generate Plan**, fill in your chapter name, member count, interests, and start date, then click **Generate Plan**. A full 90-day activity schedule is created in seconds.

### 3 — Manage Activities
On the **Plan** page you can:
- Filter activities by type (email, newsletter, social event, milestone) or status
- Click any activity to expand it and **Generate Content** — the AI drafts the full text
- Edit title, description, date, or status inline
- Mark activities complete or skip them
- Delete anything you don't need

### 4 — Dashboard
The **Dashboard** shows total activity counts, a breakdown by type, and the next 7 days of pending activities.

## Project Structure

```
prisma/
  schema.prisma         # User + Activity models
src/
  app/
    api/
      auth/             # NextAuth handlers + dev login bypass
      activities/       # CRUD endpoints (list, get, patch, delete, generate content)
      plan/generate/    # AI plan generation endpoint
      calendar/sync/    # Google Calendar sync endpoints
    dashboard/          # Overview stats page (server component)
    login/              # Login page with Google + Dev Login
    plan/               # Timeline view + wizard form
  components/
    plan/               # ActivityCard, EditModal, ContentGenerator, FilterBar, CalendarSyncButton
  lib/
    auth.ts             # NextAuth config — single source of truth for auth
    prompts.ts          # All AI prompt templates (plan generation + content types)
    parsers.ts          # Robust JSON extraction for AI responses
    api-helpers.ts      # Shared auth + ownership check utilities
    google-calendar.ts  # Calendar client with automatic token refresh
    mock-ai.ts          # Mock data generator (USE_MOCK_AI=true)
  types/
    plan.ts             # Shared TypeScript types
    next-auth.d.ts      # Session type augmentation
```

## Design Notes

**AI JSON parsing** — Claude occasionally wraps JSON in markdown fences or adds preamble text. `src/lib/parsers.ts` uses a three-strategy fallback (direct parse → strip fences → find first bracket) plus one automatic retry with a simplified prompt before giving up. This makes plan generation robust without requiring a schema validator.

**Auth pattern** — `getAuthSession()` and `getOwnedActivity()` in `api-helpers.ts` return discriminated union types. After the null check, TypeScript statically narrows the type to non-null — eliminating all `!` assertions across every API route.

**Token refresh** — The Google Calendar client listens for the googleapis `on('tokens')` event and automatically persists refreshed access tokens to the database. This prevents silent auth failures on long-lived sessions without any manual polling.

**Mock AI mode** — Setting `USE_MOCK_AI=true` (the default) bypasses all Anthropic API calls and returns templated data instead. This makes the full UI demoable offline with no API keys, and keeps mock data in one file (`mock-ai.ts`) so it's easy to swap out.

**Route protection** — A single `middleware.ts` at the project root guards all `/dashboard/*`, `/plan/*`, and `/api/*` routes. Unauthenticated requests to pages redirect to `/login`; API requests return 401.

## Enabling Live APIs

To switch from mock data to real AI responses, update your `.env` or `.env.local`:

```bash
# Remove or set to false to use real Anthropic API
USE_MOCK_AI=false
ANTHROPIC_API_KEY=sk-ant-...

# Add real Google OAuth credentials for login + Calendar sync
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

For Google OAuth, create credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with:
- **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google`
- **Scopes:** `openid`, `email`, `profile`, `https://www.googleapis.com/auth/calendar.events`

**Live API support is fully implemented** — all prompts, token refresh logic, and error handling are in place. The next update will wire in production deployment to Vercel with a PostgreSQL database.

## Status

**Prototype — functional and demoable locally.** All core features are implemented and tested. Production deployment (Vercel + PostgreSQL + live API keys) is the next planned step.

## Roadmap

- [ ] Deploy to Vercel with PostgreSQL
- [ ] Enable live Anthropic API calls in production
- [ ] Add automated tests (vitest) for parsers and API ownership checks
- [ ] Rate limiting on AI endpoints
- [ ] Export plan to PDF / CSV
- [ ] Support multiple plans per user
- [ ] Email sending integration (send generated emails directly via Resend or SendGrid)

## License

Private — no license yet.
