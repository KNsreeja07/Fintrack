# FinTrack — Personal Finance Dashboard

> A modern, full-featured financial tracking dashboard built with React, TypeScript, and Recharts. Visualise income, expenses, investments, and spending health — all in one place.

---

## Table of Contents

1. [Overview of Approach](#overview-of-approach)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Features](#features)
6. [Role-Based Access](#role-based-access)
7. [Database Schema](#database-schema)
8. [Notes & Known Limitations](#notes--known-limitations)

---

## Overview of Approach

FinTrack follows a **component-driven, single-page architecture** with three primary views — Dashboard, Transactions, and Insights — each rendered conditionally based on a top-level navigation state managed in `App.tsx`.

The application uses **Zustand** as a lightweight global state manager to hold transactions fetched from Supabase, UI preferences (dark mode, sidebar visibility, time range), and the active user role. Preferences are persisted to `localStorage` automatically via Zustand's `persist` middleware, so the app remembers a user's theme and role across sessions.

On the data layer, **Supabase** provides a hosted PostgreSQL database with Row Level Security (RLS) policies, ensuring only authenticated users can read or modify transaction records. The TypeScript types for the database schema are generated and maintained in `src/lib/database.types.ts`, giving full type safety across all Supabase queries.

The **Dashboard** is the most visual-heavy view. It renders a rich set of charts — area/line trend charts, a donut chart for expense breakdown, a radar chart for financial health, a composed area chart for the investment portfolio, a bar chart for monthly income vs expenses, and a fully custom **3D financial chart** implemented as a handcrafted SVG engine (no third-party 3D library). The 3D chart supports three render modes — bar, scatter, and surface — and uses an oblique cabinet projection to give depth without requiring WebGL.

The **Transactions** view is the operational core of the app. It works off local mock data (with full CRUD wired in-memory) and is designed to be swapped for live Supabase calls without architectural changes. Admins get access to add, edit, delete, flag, approve, and annotate transactions, while Viewers get a read-only filtered table.

The **Insights** view presents a snapshot of financial health: six KPI cards, a set of auto-generated recommendations (currently mock-driven), and a spending breakdown with proportional progress bars per category.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State Management | Zustand 5 (with `persist` middleware) |
| Backend / Database | Supabase (PostgreSQL + RLS) |
| Charts | Recharts 3, custom SVG 3D engine |
| Icons | Lucide React |
| Linting | ESLint 9 + typescript-eslint |

---

## Project Structure

```
Fintrack-main/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Root component — routing + layout
│   ├── index.css                  # Tailwind base styles
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── Navbar.tsx             # Top bar — role switcher, dark mode toggle, sidebar toggle
│   │   ├── Sidebar.tsx            # Navigation sidebar — Dashboard / Transactions / Insights
│   │   ├── Dashboard.tsx          # Main analytics view with all charts
│   │   ├── Transactions.tsx       # CRUD transaction table with filters
│   │   └── Insights.tsx           # KPI insights, recommendations, spending breakdown
│   ├── store/
│   │   └── useStore.ts            # Zustand store — transactions, UI state, Supabase actions
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client initialisation
│   │   └── database.types.ts      # TypeScript types auto-generated from DB schema
│   └── utils/
│       └── calculations.ts        # Pure financial calculation helpers + CSV/JSON export
└── supabase/
    └── migrations/
        └── 20260405121531_create_transactions_table.sql
```

---

## Setup Instructions

### Prerequisites

Make sure you have the following installed before starting:

- **Node.js** v18 or higher
- **npm** v9 or higher (comes with Node.js)


---

### Step 1 — Clone or Extract the Project

If you received a ZIP file, extract it and navigate into the project folder:

```bash
unzip Fintrack-main.zip
cd Fintrack-main
```


---


### Step 2 — Install Dependencies

```bash
npm install
```

This will install all packages listed in `package.json`, including React, Tailwind, Zustand, Supabase, Recharts, and Lucide React.

---

### Step 3 — Start the Development Server

```bash
npm run dev
```

Vite will start a local development server. Open your browser and navigate to:

```
http://localhost:5173
```

You should see the FinTrack dashboard.

---

### Step 4 — Build for Production (Optional)

To create an optimised production build:

```bash
npm run build
```

The output will be placed in the `dist/` folder. You can preview it locally with:

```bash
npm run preview
```

To deploy, upload the `dist/` folder to any static hosting service — Vercel, Netlify, GitHub Pages, or Cloudflare Pages all work well.

---

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server at `localhost:5173` |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm run typecheck` | Run the TypeScript compiler without emitting (type checking only) |

---

## Features

### 1. Dashboard

The Dashboard is the home view and the most information-dense page in the app.

**KPI Summary Cards**

Four cards at the top display the key financial metrics for the current period:
- **Total Balance** — net balance (income minus expenses)
- **Monthly Income** — total income for the month
- **Monthly Expenses** — total expenses for the month
- **Savings Rate** — percentage of income that was saved

Each card includes a trend badge (e.g. +3.2%) and uses colour-coded iconography for quick visual scanning.

**Trend Analysis Chart**

An interactive chart showing financial trends over time. Users can switch between:
- **Time range**: Week, Month, Year
- **Metric**: Balance, Income, Expenses, Savings
- **Chart type**: Area chart (shaded fill) or Line chart

The chart uses Recharts' `AreaChart` and `LineChart` components with a custom gradient fill and formatted tooltips showing INR values.

**Expense Breakdown Donut Chart**

A pie/donut chart breaking down expenses by category (Housing, Food, Transport, Utilities, etc.). Hovering a segment shows the exact value. A colour-coded legend shows percentage share for the top 6 categories.

**3D Financial Chart (Custom SVG Engine)**

One of the most distinctive features — a fully handcrafted 3D chart rendered in SVG using an oblique cabinet projection. No WebGL or third-party 3D library is used.

- **Three render modes:**
  - **Bar** — 3D extruded bars showing income heights with heat-map colouring (blue → green → amber → red) based on income level. Each bar has front, side, and top faces with proper shading.
  - **Scatter** — 3D scatter plot where each point is positioned in X (time), Y (income), Z (expenses or balance) space, rendered as shaded spheres with drop shadows.
  - **Surface** — A ribbon mesh surface that spreads across the time and depth axes, with a prominent front-edge ridge line, showing trend intensity as a heat-map.
- **Two Z-axis options:** switch between Expenses and Balance as the depth metric.
- **Time datasets:** Weekly or Monthly data.
- **Hover tooltips:** Hovering any data point shows exact income and Z-metric values.

**Financial Health Radar Chart**

A radar/spider chart scoring six financial health dimensions: Savings, Investment, Debt Management, Budgeting, Emergency Fund, and Retirement Planning. Each dimension is scored out of 100, giving a quick visual of where financial health is strong or needs attention.

**Investment Portfolio Breakdown**

A composed area chart showing six months of investment value across four asset classes: Stocks, Mutual Funds, Fixed Deposits, and Gold. Users can highlight any single asset class to compare its trajectory against the others.

**Income vs Expenses Bar Chart**

A side-by-side bar chart comparing monthly income and expenses for the full year (12 months). Income bars are green; expense bars are red. Tooltips show exact INR values.

**Recent Transactions List**

A quick-view list of the 7 most recent transactions, each showing description, category, date, and a colour-coded amount (green for income, red for expense).

---

### 2. Transactions

The Transactions page is the operational management hub for all financial records.

**Summary Bar**

Four summary stat cards always visible at the top: Total Income, Total Expense, Net Balance, and a Needs Review count (pending + flagged items for admins, or just pending for viewers).

**Search**

A live text search bar filters the transaction table in real time across description, category, and account name.

**Advanced Filters**

Clicking the Filters button expands a panel with eight independent filter controls:
- Type (Income / Expense / All)
- Category (dynamic dropdown from actual transaction data)
- Status (Approved / Pending / Flagged — Admin only)
- Account (dynamic dropdown)
- Date From and Date To (date range)
- Min Amount and Max Amount (numeric range)

An active filter count badge shows how many filters are currently applied, and a "Clear all filters" button resets everything at once.

**Sorting**

Transactions can be sorted by Date, Amount, or Status (Admin only). A toggle button switches between ascending and descending order.

**Transaction Table**

The main data table displays: Date, Description (with note preview for flagged items), Category (pill badge), Account, Amount (colour-coded, signed), Type badge, and Status badge. Flagged rows are highlighted in a subtle red background to draw attention.

**Status System**

Each transaction has one of three statuses, shown as a labelled badge with an icon:
- **Approved** (green checkmark) — reviewed and confirmed
- **Pending** (amber clock) — awaiting review
- **Flagged** (red triangle) — marked as suspicious or requiring action

**Admin Actions (Row-Level Context Menu)**

Each transaction row has a "…" button that opens a context menu with:
- **Edit transaction** — opens a modal to modify all fields
- **Mark as reviewed / Mark unreviewed** — toggles approved ↔ pending status
- **Flag as suspicious / Unflag** — toggles flagged status
- **Add/Edit note** — attaches an internal admin-only note visible below the description
- **Delete** — removes the transaction with a confirmation prompt

**Add Transaction (Admin Only)**

A full modal form with fields for Date, Type, Description, Category, Account, and Amount. New transactions are added at the top of the list with a "pending" status.

**Bulk Selection (Admin Only)**

A checkbox in the table header selects or deselects all visible transactions. Individual rows have their own checkboxes. When any rows are selected, a Bulk Actions button appears with options to Approve All selected or Delete All selected.

**Export**

An Export dropdown offers two formats:
- **CSV** — comma-separated file of all currently-filtered transactions
- **JSON** — structured JSON array of all currently-filtered transactions

---

### 3. Insights

The Insights page provides a higher-level summary of financial health.

**KPI Insight Cards**

Six metric cards giving a snapshot of the current period:
- Highest Spending Category
- Average Daily Spending
- Monthly Expense Change (vs prior month)
- Savings Rate
- Total Income for the month
- Net Savings for the month

Each card has a colour-coded icon (green for good, red for warning, purple for informational).

**Recommendations Panel**

An auto-generated list of financial recommendations displayed as colour-coded alerts: green for positive trends, amber for warnings, blue for informational notes. Examples include flagging a good savings rate, noting a dining-out spending spike, or confirming that the debt repayment ratio is healthy.

**Spending Breakdown**

A ranked list of expense categories with proportional horizontal progress bars. Each bar shows the category name, absolute INR amount, and percentage share of total expenses. Bars use distinct colours per category for easy visual differentiation.

---

### 4. Navigation & UI

**Sidebar**

A collapsible left sidebar with navigation links to Dashboard, Transactions, and Insights. Collapses to a hidden overlay on mobile (with a backdrop click-to-close). Toggled from the Navbar hamburger button.

**Dark Mode**

A sun/moon toggle in the navbar switches the entire app between light and dark themes. The dark palette uses gray-900/800/700 backgrounds with white text and appropriately muted secondary text. The preference is persisted in `localStorage` so it survives page refreshes.

**Role Switcher**

A dropdown in the navbar switches between Admin and Viewer roles. This is a UI-only access control mechanism — in production, this would be replaced by Supabase Auth roles or JWT claims. The role preference is also persisted across sessions.

---

## Role-Based Access

| Feature | Admin | Viewer |
|---|---|---|
| View Dashboard | ✓ | ✓ |
| View Transactions table | ✓ | ✓ |
| Add new transactions | ✓ | ✗ |
| Edit transactions | ✓ | ✗ |
| Delete transactions | ✓ | ✗ |
| Flag / unflag transactions | ✓ | ✗ |
| Mark as reviewed | ✓ | ✗ |
| Add internal notes | ✓ | ✗ |
| Bulk select & approve | ✓ | ✗ |
| Filter by Status | ✓ | ✗ |
| Export CSV / JSON | ✓ | ✓ |
| View Insights | ✓ | ✓ |

---


## Notes & Known Limitations

- **Mock Data:** The Dashboard and Insights views currently render from hardcoded mock data arrays defined within the component files. The Transactions view also uses mock data but with full in-memory CRUD. Wiring these views to live Supabase data requires replacing the mock constants with the `transactions` array from `useStore()` and the calculation helpers from `src/utils/calculations.ts`.

- **Authentication:** There is no login screen. Supabase RLS requires authenticated users — for local testing with the anon key, you may need to temporarily relax the RLS policies to allow public access, or add Supabase Auth to the project.

- **Currency:** The Dashboard and Insights use Indian Rupee (INR) formatting. The Transactions view uses USD. This inconsistency should be resolved by standardising the `formatCurrency` helper.

- **Insights Page:** The original `Insights.tsx` implementation was comment-preserved (visible in the file) and replaced with a mock-data version. The commented-out version connects to live Supabase data and can be restored by uncommenting and removing the mock implementation.

- **Production Considerations:** Before deploying to production, restrict the Supabase RLS policies to user-specific rows (using `auth.uid()`), integrate Supabase Auth for login, and remove the client-side role switcher in favour of server-side role claims.
