# Chapter Agent — Product Requirements Document

## Overview

Chapter Agent is a Next.js 14 web application that helps fraternity/sorority chapter leaders plan and manage 90-day engagement campaigns. It uses AI (Anthropic Claude) to generate activity plans and content, and integrates with Google Calendar for scheduling.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v4 with Google OAuth
- **AI**: Anthropic Claude API (@anthropic-ai/sdk)
- **Calendar**: Google Calendar API v3 (googleapis)
- **Deployment**: Vercel

## Data Model

### User Table
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| email | String | Unique |
| name | String? | From Google profile |
| image | String? | Google avatar URL |
| googleId | String | Unique, from Google OAuth |
| googleTokens | Json? | { access_token, refresh_token, expiry_date } |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Activity Table
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| userId | String | FK to User |
| type | ActivityType enum | email, newsletter, social_event, milestone |
| title | String | Activity title |
| description | String? | Activity description |
| scheduledDate | DateTime | When to execute |
| status | ActivityStatus enum | pending, completed, skipped |
| generatedContent | String? | AI-generated content |
| calendarEventId | String? | Google Calendar event ID |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Indexes: `[userId, scheduledDate]`, `[userId, status]`

## Features

### 1. Authentication
- Google OAuth sign-in only
- JWT session strategy
- OAuth scopes: openid, email, profile, calendar.events
- Store Google tokens for Calendar API access
- Route protection via Next.js middleware

### 2. Plan Generation
- Multi-step wizard form collecting: chapter name, member count, interests, start date
- AI generates a 90-day engagement plan with 20-30 activities
- Activities bulk-inserted into database
- Activity types: emails, newsletters, social events, milestones

### 3. Plan Viewing & Activity Management
- Timeline view of all activities
- Filter by type, status, date range
- Edit activity details (title, description, date)
- Change activity status (pending → completed/skipped)
- Delete activities

### 4. AI Content Generation
- Generate content for individual activities using Claude
- Different prompts per activity type (email copy, newsletter text, event invitation, milestone announcement)
- Edit and save generated content
- Optional additional context from user

### 5. Dashboard
- Overview stats (activity counts by status)
- Upcoming activities (next 7 days)
- Quick action buttons (Generate Plan, View Plan)

### 6. Google Calendar Sync
- Sync individual activities to Google Calendar
- Update existing calendar events on activity edit
- Remove calendar events
- Handle token refresh automatically

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/plan/generate` | POST | Generate plan via AI |
| `/api/activities` | GET | List activities (with filters) |
| `/api/activities/[id]` | GET, PATCH, DELETE | Single activity CRUD |
| `/api/activities/[id]/generate` | POST | Generate AI content for activity |
| `/api/calendar/sync` | POST | Sync activity to Google Calendar |
| `/api/calendar/sync/[id]` | DELETE | Remove calendar event |

## Environment Variables

```
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_API_KEY=
```

## Key Implementation Notes

1. **Token Refresh**: Use `prompt: 'consent'` in Google OAuth to always receive refresh_token. Use googleapis `on('tokens')` event to persist refreshed tokens.
2. **JSON Parsing**: AI responses may include markdown fences. Parser should try direct parse → strip fences → extract first `[`/`{` to last `]`/`}` → retry with simplified prompt.
3. **Security**: Every API route validates session, every mutation checks ownership (`activity.userId === session.user.id`), never expose googleTokens in responses.
4. **Prisma Singleton**: Use global singleton pattern to avoid connection leaks during hot reload in development.
