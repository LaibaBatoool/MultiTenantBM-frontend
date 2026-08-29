# MultiTenantBM — Frontend

React + TypeScript single-page application for the MultiTenantBM platform — a multi-tenant business management system covering accounting, HR, projects, and finance operations for multiple independent business units.

Live app: https://multi-tenant-bm-frontend.vercel.app
Backend repo: [MultiTenantBM-backend](https://github.com/LaibaBatoool/MultiTenantBM-backend)

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite
- **UI library:** Ant Design (antd)
- **Routing:** React Router
- **HTTP client:** Axios
- **Deployment:** Vercel

## Features

- JWT-based authentication with role/permission-aware routing (`PermissionRoute`)
- Business-unit switcher — every screen scopes data to the currently selected tenant
- Full accounting workflow: chart of accounts, journal entries, general ledger, trial balance, balance sheet, profit & loss
- Cash & transactions: payments, receipts, transfers, bank accounts, capital contributions, opening balances
- Accounts Receivable & Accounts Payable — live customer/vendor ledgers with Excel export
- Sales Invoices — multi-line invoicing with automatic tax calculation, PDF download, and Excel export
- Expense management: expense types, expense entries, expense reports
- HR & organization: staff, employees, roles, business units, companies
- Projects, project profitability, and assets tracking
- User profile management and password reset flow

## Getting Started

### Prerequisites

- Node.js 18+
- The [backend API](https://github.com/LaibaBatoool/MultiTenantBM-backend) running locally or deployed

### Installation

```bash
git clone https://github.com/LaibaBatoool/MultiTenantBM-frontend.git
cd MultiTenantBM-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SERVER_BASE_URL=http://localhost:3000
```

`VITE_API_BASE_URL` is used for all API requests; `VITE_SERVER_BASE_URL` is used for resolving static/uploaded file URLs returned by the backend.

### Run Locally

```bash
npm run dev
```

App will be available at `http://localhost:5173`.

### Other Scripts

```bash
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint      # lint the codebase
```

## Project Structure

```
src/
├── api/              # axios instance + one file per resource (e.g. salesInvoices.ts)
├── components/        # shared layout (AppLayout), guards (PermissionRoute)
├── context/            # BusinessUnitContext and other app-wide context
├── constants/          # API base URL and shared constants
├── pages/               # one page per route (list, form, and ledger/report views)
├── App.tsx              # route definitions
└── main.tsx
```

Each backend module generally has a matching pair of frontend files: an `api/<module>.ts` for HTTP calls and one or more `pages/<Module>.tsx` for the UI (e.g. `SalesInvoices.tsx` for the list, `SalesInvoiceForm.tsx` for create/view).

## Deployment

Deployed as a static site on **Vercel**, built with `npm run build` and served from the `dist/` output.

