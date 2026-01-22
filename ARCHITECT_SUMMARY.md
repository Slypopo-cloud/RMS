# Olu's Kitchen | System Architecture

A comprehensive technical overview of the modern Restaurant Management System.

## 🏗️ Technology Stack

- **Core Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database ORM**: Prisma with SQLite (Local Dev)
- **Styling**: TailwindCSS with high-end glassmorphism design system
- **Authentication**: NextAuth.js v5 (Beta) with `proxy.ts` middleware
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🔐 Security & Access Control (RBAC)

The system enforces strict Role-Based Access Control via a centralized `auth.config.ts` and middleware.

| Role              | Permissions                                                                       |
| :---------------- | :-------------------------------------------------------------------------------- |
| **ADMIN**         | Full access to all modules, including User Management and Financials.             |
| **MANAGER**       | Access to POS, Kitchen, Orders, Inventory, Reports, and Menu. No User Management. |
| **CASHIER**       | Access to POS, Order History, and Table Reservations.                             |
| **KITCHEN_STAFF** | Access to Kitchen Display System (KDS) and Inventory Stock alerts.                |

## 🚀 Key Modules

### 1. Digital Gastronomy (Public Menu)

- **Mobile-First Design**: Optimized for customer phones with vibrant dark mode aesthetics.
- **Smart Cart**: Persistent client-side cart for real-time order management.
- **Async Execution**: Leveraging React Suspense and loading skeletons for a layout-shift-free experience.

### 2. Live Kitchen Pipeline (KDS)

- **Auto-Sync**: 30-second "Heartbeat" polling that synchronizes the kitchen screen with new orders.
- **Status Lifecycle**: Transition orders from `PENDING` → `PREPARING` → `READY` → `COMPLETED`.

### 3. Shift & Attendance Portal

- **Duty Cycles**: Integrated clock-in/out logic for staff attendance tracking.
- **Labor Correlation**: Revenue metrics are cross-referenced with duty hours for advanced business insights.

## 🛠️ Performance & Resilience

- **Error Boundaries**: Dedicated recovery states for the Staff Dashboard and Customer Menu.
- **Image Optimization**: Fully integrated with Next.js `<Image />` for automatic sizing and lazy loading.
- **Dynamic SEO**: Metadata generation for the public menu to ensure optimal search indexation.

---

_System Document generated for Olu's Kitchen RMS v1.0.0_
