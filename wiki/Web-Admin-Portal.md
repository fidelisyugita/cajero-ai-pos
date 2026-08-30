# 💻 Web Admin Portal

The **Cajero Web Admin Portal** is a modern management dashboard built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS v4**. It gives business owners and store managers comprehensive control over inventory, staff, financial reporting, dynamic pricing rules, and POS audit histories.

---

## 🏗️ Architecture & Feature-Sliced Design

The frontend codebase is organized using a feature-sliced architecture under `src/features/`, ensuring high modularity and separation of concerns:

```mermaid
graph TD
    subgraph CoreApp["Application Shell & Providers"]
        Main[main.tsx]
        Layouts[Layouts / Navigation Shell]
        QueryProvider[TanStack Query Client Provider]
    end

    subgraph FeatureModules["Feature Modules (src/features/)"]
        Auth[🔐 auth: Login & Session Management]
        Products[📦 products & productCategories: Master Catalog]
        Stock[📊 stockMovements: Inventory & Intake]
        PettyCash[💸 pettyCash: Daily Expense Ledger]
        POS[🛍️ pos: Fallback Web Checkout Terminal]
        Transactions[🧾 transactions: Order History & Receipts]
        Reports[📈 reports: Financial Analytics & Trends]
        AuditLogs[📜 logHistories: Audit Trails & Security Logs]
    end

    subgraph SharedLayers["Shared Foundation Layer"]
        Components[Shared UI Components (Radix UI / Tailwind)]
        Lib[Axios Client & Storage Adapters]
        Services[API Service Endpoints]
        Types[TypeScript Domain Interfaces]
    end

    Main --> QueryProvider
    QueryProvider --> Layouts
    Layouts --> FeatureModules
    FeatureModules --> SharedLayers
```

---

## 📦 Core Feature Modules

### 1. Master Product & Category Catalog (`src/features/products`)
- **Category Hierarchy**: Organize inventory into logical parent/child categories.
- **Variants & Pricing**: Define multi-variant items (sizes, flavors, add-ons) with individual SKU and barcode assignment.
- **Recipe & Ingredient Linking**: Map products to raw materials for automated stock deduction upon sale.

### 2. Inventory & Stock Movements (`src/features/stockMovements`)
- **Stock Intake**: Record incoming shipments with supplier metadata and cost per unit.
- **Stock Adjustments & Waste**: Track manual inventory adjustments, shrinkage, and expired items with audit remarks.
- **Low Stock Thresholds**: Configurable notification triggers when stock drops below safety levels.

### 3. Petty Cash & Expense Ledger (`src/features/pettyCash`)
- **Daily Cash Drawer Tracking**: Monitor opening floats, in-shift cash injections, and cash withdrawals.
- **Expense Categorization**: Group operational expenditures (utilities, maintenance, supplies) with attached digital receipts.

### 4. Sales Transactions & Order Audits (`src/features/transactions`)
- **Historical Sales Explorer**: Filterable transaction table with date ranges, cashier filters, and payment method breakdowns.
- **Digital Invoice Preview**: View and reprint standardized receipts in browser or export to PDF.
- **Refund & Void Management**: Supervisor-authorized order cancellations with logged audit justifications.

### 5. Financial Reports & Analytics (`src/features/reports`)
- **Revenue & Gross Profit Trends**: Interactive visual charts showing hourly, daily, and monthly performance.
- **Top-Selling Item Breakdown**: Quantity and revenue rankings per product and category.
- **Payment Method Distribution**: Percentage breakdowns across Cash, Credit/Debit Card, and QRIS payments.

### 6. Audit & Log Histories (`src/features/logHistories`)
- **Security Audit Trail**: Chronological timeline of security events, price overrides, discount approvals, and user permission changes.

---

## ⚡ State Management & API Integration

- **Server State**: Managed via `@tanstack/react-query` with configurable cache invalidation strategies and optimistic UI updates.
- **Client State**: Lightweight global stores powered by `zustand` for sidebar collapse states, active store filters, and user session tokens.
- **API Client**: Centralized Axios client configured with automatic `Authorization: Bearer <token>` injection and 401 Unauthorized redirect interceptors.

---

## 🛠️ Development & Production Commands

```bash
cd frontend

# Install dependencies using Yarn Berry
yarn install

# Start Vite dev server with hot module replacement (HMR)
yarn dev

# Run ESLint validation
yarn lint

# Build optimized production bundle
yarn build

# Preview production build locally
yarn preview
```
