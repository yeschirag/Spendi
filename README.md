# Spendi

Spendi is a modern expense-tracking and bill-splitting web app for people who share money across friends, groups, trips, apartments, and everyday spending. It combines a polished React interface with Supabase authentication, relational expense storage, friend requests, group invite links, and balance calculations.

## What Spendi Does

- Track personal and shared expenses in one dashboard.
- Split bills equally or with custom amounts.
- See who you owe and who owes you.
- Manage friends through searchable profiles and request workflows.
- Create groups for trips, homes, events, or teams.
- Invite group members with shareable join links.
- View group totals, members, expenses, and simplified balances.
- Analyze spending with weekly and category-based charts.
- Maintain user profiles with Supabase Auth and profile metadata.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 3, custom theme/fonts |
| Backend/Data | Supabase Auth + Postgres |
| Charts | Chart.js, react-chartjs-2 |
| UI/Animation | Lucide React, Framer Motion, Lenis, React Joyride |
| Deployment | Vercel SPA rewrite configuration |

## Project Structure

```text
Spendi/
├── public/                  # Logo, favicon, icon, and video/image assets
├── src/
│   ├── App.jsx              # App providers, protected routes, layouts, join route
│   ├── main.jsx             # React entry point
│   ├── components/          # Dashboard, layout, modal, and shared UI components
│   ├── context/             # Auth, app data, and friend state providers
│   ├── lib/supabase.js      # Supabase client initialization
│   ├── pages/               # Landing, auth, dashboard feature pages
│   ├── services/db.js       # Supabase queries and data transformation logic
│   ├── styles/              # Fonts and theme variables
│   └── utils/               # Category icon helpers
├── supabase/schema.sql      # Database schema, seed data, indexes, functions, RLS
├── vercel.json              # SPA fallback rewrites for client-side routing
├── tailwind.config.js       # Tailwind theme configuration
├── vite.config.js           # Vite configuration
└── package.json             # Scripts and dependencies
```

## Main App Routes

| Route | Description |
| --- | --- |
| `/` | Public landing page |
| `/auth` | Login, sign up, and Google OAuth page |
| `/dashboard` | Protected analytics and balance dashboard |
| `/add-expense` | Add a personal, friend, or group expense |
| `/edit-expense/:id` | Edit or delete an existing expense |
| `/friends` | Manage friends, search users, and handle requests |
| `/friend/:id` | View friend-specific expense and balance details |
| `/groups` | Create and browse groups |
| `/group/:id` | View group members, expenses, invite link, and balances |
| `/join/:token` | Protected group invite link handler |
| `/history` | Expense history |
| `/profile` | User profile management |

## Core Features

### Authentication and Profiles

- Email/password signup and login through Supabase Auth.
- Google OAuth support.
- Automatic profile creation through the database trigger in `supabase/schema.sql`.
- Profile update flow from the app.
- Client-side protected routes for authenticated areas.

### Expenses and Splits

- Create, update, and soft-delete expenses.
- Store category, amount, date, creator, split type, and optional group association.
- Track participants through `expense_participants` with `amount_paid` and `amount_owed`.
- Supports equal and custom split data in the UI/service layer.

### Friends and Balances

- Search users by email/name.
- Send, accept, reject, and remove friend requests.
- Aggregate friend balances from the database view/query layer.
- Dashboard cards summarize personal expenses, money owed, money receivable, and friend count.

### Groups

- Create groups with name and description.
- Add members through generated invite links.
- View group expenses, members, total spend, and simplified balances.
- Add expenses directly into a group context.

### Analytics and UI

- Weekly spending bar chart.
- Category breakdown doughnut chart.
- Responsive dark dashboard layout with desktop sidebar and mobile bottom navigation.
- Landing page with editorial-style sections and motion/video treatment.
- In-app product tour support via React Joyride.

## Database Overview

The Supabase schema is defined in `supabase/schema.sql` and includes:

- `profiles` - user profile data linked to `auth.users`.
- `categories` - system and user-created expense categories.
- `friendships` - friend request and friendship lifecycle.
- `expenses` - expense records with category, creator, amount, date, split type, and group link.
- `expense_participants` - per-user paid/owed rows for each expense.
- `settlements` - payment settlement records.
- `notifications` - user notification storage.
- `groups` - shared group/trip/event containers.
- `group_members` - group membership and roles.
- `group_invites` - shareable group invite tokens.

The schema also defines:

- Postgres extensions: `uuid-ossp`, `pg_trgm`.
- Seeded system categories such as Food, Transport, Rent, Travel, Subscriptions, and Other.
- Indexes for common profile, friendship, expense, and participant queries.
- Row Level Security policies for authenticated user access boundaries.
- Utility triggers such as `set_updated_at` and automatic profile creation on new auth users.

## Getting Started

### Prerequisites

- Node.js 20+ recommended.
- npm.
- A Supabase project.

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a local environment file in the project root:

```bash
.env.local
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

`src/lib/supabase.js` also supports `VITE_SUPABASE_PUBLISHABLE_KEY` as an alternative key name.

### 3. Set Up Supabase

Run the SQL in `supabase/schema.sql` against your Supabase database.

> Warning: the schema file begins by dropping existing related tables. Review it before running against a database that contains important data.

Recommended setup flow:

1. Open the Supabase SQL Editor.
2. Paste the contents of `supabase/schema.sql`.
3. Run it on a new or disposable project database.
4. Enable/configure Google OAuth in Supabase if you want Google sign-in.
5. Add your local and deployed URLs to Supabase Auth redirect settings.

For local development, common redirect URLs include:

```text
http://localhost:5173
http://localhost:5173/dashboard
```

### 4. Start Development Server

```bash
npm run dev
```

The app will usually be available at:

```text
http://localhost:5173
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production assets |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Deployment

This project includes `vercel.json` with a fallback rewrite to `index.html`, so client-side routes like `/dashboard`, `/groups`, and `/join/:token` work correctly when deployed to Vercel.

When deploying, configure the same Supabase environment variables in your hosting provider:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

Also add your production domain to Supabase Auth redirect URLs, especially if Google OAuth is enabled.

## Notes for Contributors

- Keep Supabase queries centralized in `src/services/db.js` unless a feature requires a specialized service.
- Keep authenticated app-wide data in `AppContext`, authentication state in `AuthContext`, and friendship workflows in `FriendContext`.
- Add protected pages through `src/App.jsx` using the existing `ProtectedRoute` and `MainLayout` patterns.
- Prefer extending the existing Tailwind theme and shared components before introducing new UI patterns.
- Review RLS policies whenever adding tables or modifying access rules.

## License

No license file is currently included. Add one before distributing or open-sourcing the project.