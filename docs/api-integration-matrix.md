# API Integration Matrix

| Screen/Flow | Frontend route/file | Backend endpoint(s) | Status |
|---|---|---|---|
| Signin/Signup/OTP | `app/routes/auth/*` | `/auth/signup/`, `/auth/login/`, `/auth/verify-otp/`, `/auth/request-otp/` | Integrated |
| Session refresh/logout | `app/lib/session.server.ts`, `app/routes/dashboard/layout.tsx` | `/auth/refresh-token/`, `/auth/logout/` | Integrated |
| Organisations list/create | `app/routes/dashboard/organisations/*` | `/businesses/` | Integrated |
| Team members | `app/routes/dashboard/team/index.tsx` | `/businesses/{id}/members/*` | Integrated |
| Products | `app/routes/dashboard/products/*` | `/products/*`, `/inventory/businesses/{id}/categories/`, `/inventory/businesses/{id}/subcategories/` | Integrated |
| Stock movements | `app/lib/api/inventory.ts` | `/inventory/{business_id}/stock-movements/`, `/inventory/{business_id}/products/low-stock/`, `/inventory/{business_id}/products/expired/` | Added API layer |
| Sales/invoices | `app/lib/api/sales.ts`, `app/routes/dashboard/sales/index.tsx` | `/sales/*` | Pending UI rewrite |
| Customers | `app/lib/api/customers.ts` | `/customers/` | Added API layer |
| Finance | `app/lib/api/finance.ts` | `/finance/` | Added API layer |
| Reports | `app/lib/api/reports.ts` | `/reports/*` | Added API layer |
| Notifications | `app/lib/api/notifications.ts` | `/notifications/*` | Added API layer |
| Dashboard analytics | `app/lib/api/dashboard.ts` | `/dashboard/summary/`, `/dashboard/insights/` | Added API layer |
