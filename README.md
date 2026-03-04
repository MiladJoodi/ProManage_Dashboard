# ProManage - Project Management Dashboard

A premium, fully-featured Project Management Dashboard built from scratch with Next.js 16. Features drag-and-drop Kanban boards, interactive analytics charts, comprehensive task/project/user management, financial tracking, and a modern responsive UI with smooth animations.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, CSS Variables |
| UI Components | shadcn/ui + Radix UI (35 components) |
| State Management | Zustand (5 stores) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Drag & Drop | @dnd-kit (core, sortable, utilities) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Notifications | Sonner |
| Theme | next-themes (Dark/Light/System) |
| HTTP Client | Axios |
| Date Utilities | date-fns |

## Features

### Core
- **Dashboard** - KPI stats, revenue charts, task distribution, recent activities, project progress
- **Task Management** - Drag-and-drop Kanban board (To Do / In Progress / In Review / Done)
- **Project Management** - Project cards, milestones, budget tracking, team assignment
- **User Management** - Team members, roles (Admin/Manager/User), permissions

### Financial
- **Invoices** - Create, track, and manage invoices with line items
- **Transactions** - Income/expense/transfer tracking with summaries
- **Orders** - Order management with status tracking
- **Products** - Product inventory with stock management

### Analytics & Reports
- **Analytics** - Revenue trends, task distribution, team performance charts
- **Reports** - Financial reports, error reports with visualizations
- **Activities** - Audit trail with timeline view

### System
- **Notifications** - Real-time notification center with filters
- **Alerts** - System alerts with severity levels
- **Settings** - General, notifications, appearance, data management
- **Security** - Password change, 2FA, session management
- **Profile** - User profile with edit capabilities

### Help & Support
- **Support** - Ticket system with priority levels
- **FAQ** - Searchable FAQ with accordion
- **Articles** - Knowledge base with categories
- **Tools** - API key generator, webhook tester, data export, system status

### UI/UX
- Dark/Light/System theme
- Fully responsive (mobile-first)
- Smooth Framer Motion animations
- Collapsible sidebar navigation
- Global search
- Form validation with error messages
- Toast notifications
- Loading skeletons
- Empty states

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/dashboard-cla.git
cd dashboard-cla
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Manager | james.wilson@company.com | james123 |
| User | emily.johnson@company.com | emily123 |

## Project Structure

```
├── app/                    # Next.js App Router pages (25 routes)
│   ├── dashboard/          # Main dashboard with charts & stats
│   ├── tasks/              # Kanban board with drag-and-drop
│   ├── projects/           # Project management
│   ├── users/              # Team management
│   ├── products/           # Product inventory
│   ├── orders/             # Order management
│   ├── invoices/           # Invoice management
│   ├── transactions/       # Financial transactions
│   ├── analytics/          # Analytics charts
│   ├── reports/            # Financial & error reports
│   ├── activities/         # Activity audit trail
│   ├── notifications/      # Notification center
│   ├── alerts/             # System alerts
│   ├── profile/            # User profile
│   ├── settings/           # App settings
│   ├── security/           # Security settings
│   ├── support/            # Support tickets
│   ├── faq/                # FAQ accordion
│   ├── articles/           # Knowledge base
│   ├── categories/         # Category management
│   ├── tools/              # Developer tools
│   ├── login/              # Authentication
│   ├── register/           # Registration
│   └── forgot-password/    # Password reset
├── components/
│   ├── ui/                 # 35 shadcn/ui components
│   ├── sidebar.tsx         # Navigation sidebar
│   ├── page-header.tsx     # Top header bar
│   ├── dashboard-layout.tsx # Layout wrapper with auth guard
│   ├── stat-card.tsx       # KPI stat card
│   ├── data-table.tsx      # Reusable data table
│   ├── empty-state.tsx     # Empty state placeholder
│   └── theme-provider.tsx  # Theme provider
├── store/
│   ├── auth-store.ts       # Authentication state
│   ├── task-store.ts       # Task CRUD & Kanban state
│   ├── project-store.ts    # Project management state
│   ├── notification-store.ts # Notifications state
│   └── ui-store.ts         # UI state (sidebar, search)
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── data.ts             # Mock data
│   └── utils.ts            # Utility functions
└── hooks/
    ├── use-mobile.ts       # Mobile detection
    └── use-search.ts       # Search hook
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |

## License

MIT
