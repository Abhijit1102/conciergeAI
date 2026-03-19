# AI Event Concierge

AI-powered event planning assistant that generates structured venue recommendations from natural language inputs, with persistent history using MongoDB and a modern Next.js UI.

## Overview

Describe your event in plain language (e.g. *"10-person leadership retreat in the mountains, 3 days, $4000 budget"*) and get AI-curated venue recommendations with cost estimates and fit rationale.

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript   |
| Styling    | Tailwind CSS v4                    |
| State      | Zustand                            |
| Icons      | Lucide React                       |
| Animations | Framer Motion                      |
| Design     | Dark-first "Refined Dark Intelligence" aesthetic |

## Project Structure

```
conciergeAI/
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── (auth)/          # Login, Register
│   │   ├── (dashboard)/     # Main concierge page
│   │   └── layout.tsx
│   ├── components/          # UI & domain components
│   ├── lib/                 # API client, utils
│   ├── store/               # Zustand store
│   ├── hooks/               # Custom hooks
│   └── types/               # TypeScript types
├── AI_Event_Concierge_Design_Doc.docx   # Full design specification
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
cd frontend
npm run build
npm start
```

## Routes

| Route      | Description                    |
| ---------- | ------------------------------ |
| `/`        | Main dashboard — query + results + history |
| `/login`   | Sign in                        |
| `/register`| Create account                 |

## Environment Variables

| Variable              | Description                          |
| --------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:8000/api/v1`) |

When `NEXT_PUBLIC_API_URL` is unset, the app runs in **mock mode** with demo venue data.

## Design Reference

See `AI_Event_Concierge_Design_Doc.docx` for the full UI spec: design tokens, typography, component inventory, page wireframes, and state management architecture.

## License

Private
