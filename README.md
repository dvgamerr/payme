# PayMe - Complete Stack Migration

**Full-Stack Budget Tracker: Astro.js + Svelte + Bun.js**

## 🎯 Migration Overview

Complete rewrite from **Rust (Actix-web) + React + TypeScript** to **Bun.js + Astro.js + Svelte** (vanilla JavaScript).

### What Changed

| Component    | Before                  | After                         |
| ------------ | ----------------------- | ----------------------------- |
| **Backend**  | Rust + Actix-web + SQLx | **Bun.js + Astro API Routes** |
| **Frontend** | React 18 + Vite         | **Astro.js 4 + Svelte 4**     |
| **Language** | TypeScript              | **Vanilla JavaScript**        |
| **Database** | SQLite (sqlx)           | **SQLite (better-sqlite3)**   |
| **Auth**     | Cookie-based (Rust)     | **Cookie-based (Bun.js)**     |
| **Styling**  | Tailwind v4             | **Tailwind v4** ✓             |

---

## 🚀 Quick Start

```bash
# Install dependencies with Bun or npm
bun install
# or
npm install

# Start development server (http://localhost:3000)
bun run dev

# Database auto-created: payme.db
```

## 📁 Project Structure

```
frontend-astro/
├── src/
│   ├── pages/              # Astro pages & API routes
│   │   ├── api/            # Backend API endpoints (Bun.js)
│   │   │   ├── auth/       # register, login, logout, me
│   │   │   ├── months/     # Month management
│   │   │   ├── categories/ # Budget categories
│   │   │   ├── fixed-expenses/
│   │   │   └── savings/
│   │   └── *.astro         # Frontend pages
│   ├── components/         # Svelte components
│   ├── lib/               # Core libraries
│   │   ├── db.js          # SQLite + migrations
│   │   ├── auth.js        # Auth utilities
│   │   ├── api.js         # Frontend API client
│   │   └── middleware.js  # Auth middleware
│   ├── stores/            # Svelte stores (auth, theme)
│   └── styles/            # Tailwind + custom theme
├── payme.db              # SQLite database
└── AGENTS.md             # Migration tracking
```

## 🔐 API Endpoints

All endpoints use cookie-based authentication.

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Data Management

- `GET /api/months` - List months
- `GET /api/months/current` - Current month summary
- `GET /api/categories` - Budget categories
- `GET /api/fixed-expenses` - Fixed expenses
- `GET /api/savings` - Savings amount
- And more... (see full docs)

## 🎨 Design System

- **Colors**: Sand, Sage, Terracotta, Charcoal (earthy palette)
- **Font**: JetBrains Mono (monospace)
- **Dark Mode**: Class-based with localStorage persistence

## 🔧 Development

```bash
bun run dev      # Dev server
bun run build    # Production build
bun run preview  # Preview build
bun run format   # Prettier formatting
```

## 📊 Migration Status

**✅ Completed**: Project setup, database, auth API, UI components, stores  
**🔄 In Progress**: Frontend pages, remaining API endpoints  
**⏳ Pending**: Charts, import/export, testing

**Progress**: ~40% complete

See [AGENTS.md](./AGENTS.md) for detailed tracking.

---

**Built with ❤️ using Bun.js, Astro, and Svelte**
