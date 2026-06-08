# remind-me-please

A WhatsApp-style self-chat app that automatically converts your messages into tasks and reminders — **everything runs locally, no cloud required**.

---

## What it does

Send yourself messages the same way you'd message a friend. The app watches every message and automatically extracts tasks, deadlines, and reminders using a local LLM (Ollama) with a regex/chrono-node fallback when the LLM is offline.

**Send:** `"remind me to call mom at 5pm tomorrow"`
**App creates:** Task "Call mom" · due tomorrow 5 pm · browser notification fires at that time.

---

## Architecture

```
React / Next.js  (App Router, TypeScript)
      ↓
Local Database  (SQLite via Drizzle ORM + better-sqlite3)
      ↓
Task Extractor  (Ollama LLM → chrono-node heuristics fallback)
      ↓
Reminder Engine (30-second client-side polling)
      ↓
Local LLM       (Ollama · llama3.2 by default)
      ↓
Notification System (Browser Notifications API + sonner toasts)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | SQLite · `drizzle-orm` + `better-sqlite3` |
| Task extraction | Ollama HTTP API → chrono-node + regex fallback |
| Notifications | Browser Notifications API + `sonner` |
| Styling | Tailwind CSS v4 |
| Icons | `lucide-react` |
| Validation | `zod` |

---

## Database schema

Three tables managed by Drizzle ORM:

```
messages   id · content · timestamp · metadata(JSON)
tasks      id · message_id(FK) · title · due_date · priority · status
reminders  id · task_id(FK) · fire_at · fired · snooze_until
```

---

## Features

- **WhatsApp-style chat UI** — right-aligned bubbles, timestamps, double-tick read receipts, dark / light mode
- **Auto task extraction** — every message is analysed; a "Task: …" badge appears when one is detected
- **Task sidebar** — collapsible panel showing pending / completed tasks with priority chips and overdue alerts
- **Local LLM (Ollama)** — green dot in header when connected; falls back to heuristics when offline (yellow dot)
- **Reminder engine** — browser notification + in-app toast fires at the scheduled time; Snooze 10 min / Dismiss actions
- **Fully offline** — SQLite file on disk, Ollama on localhost, no external API calls

---

## Getting started

### Prerequisites

- Node.js 20+
- (Optional but recommended) [Ollama](https://ollama.com) with `llama3.2` pulled

```bash
ollama pull llama3.2
```

### Install & run

```bash
git clone https://github.com/shiven24k/remind-me-please
cd remind-me-please
npm install

# Create the SQLite database
npm run db:push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables (`.env.local`)

```
DATABASE_URL=./remind-me-please.db     # SQLite file path
OLLAMA_BASE_URL=http://localhost:11434  # Ollama server
OLLAMA_MODEL=llama3.2                   # Model to use
```

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Apply schema changes to SQLite |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Server component — fetches initial data
│   ├── layout.tsx            # Root layout with Toaster
│   ├── globals.css           # Tailwind + WhatsApp colour tokens
│   └── api/
│       ├── messages/         # GET + POST messages
│       ├── tasks/            # GET tasks, PATCH/DELETE by id
│       ├── reminders/        # GET reminders, PATCH (dismiss/snooze) by id
│       └── extract/          # POST manual extraction, GET Ollama health
├── components/
│   ├── ChatInterface.tsx     # Top-level client shell
│   ├── MessageBubble.tsx     # Chat bubble with task badge
│   ├── MessageInput.tsx      # Auto-resize textarea, Enter to send
│   ├── TaskSidebar.tsx       # Collapsible task panel
│   ├── TaskCard.tsx          # Individual task with actions
│   ├── OllamaStatus.tsx      # LLM connection indicator
│   └── ThemeToggle.tsx       # Dark / light mode toggle
├── hooks/
│   ├── useMessages.ts        # Message state + send
│   ├── useTasks.ts           # Task CRUD state
│   └── useReminders.ts       # 30s polling + notification firing
└── lib/
    ├── schema.ts             # Drizzle table definitions + types
    ├── db.ts                 # SQLite singleton
    ├── extractor.ts          # Ollama + heuristic pipeline
    └── utils.ts              # cn() helper + generateId()
```

---

## How extraction works

```
Message arrives
  → Try Ollama (POST /api/generate, 8s timeout, JSON mode)
      ✓ Validate with Zod → create task
      ✗ Timeout / offline → heuristic fallback
          → Keyword detection (remind me, buy, call, need to…)
          → Date parsing via chrono-node
          → Priority from urgency words
          → Create task if signal found, else discard
```

---

## Current status

- [x] WhatsApp-style chat UI (dark/light mode)
- [x] SQLite persistence (messages, tasks, reminders)
- [x] Ollama LLM extraction with JSON mode
- [x] Regex + chrono-node heuristic fallback
- [x] Task sidebar with priority/due-date/overdue indicators
- [x] 30-second reminder polling with browser notifications + toasts
- [x] Snooze and dismiss reminder actions
- [x] Ollama connection status indicator
