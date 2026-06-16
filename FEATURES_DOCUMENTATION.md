# Frontend Developer Requirements Specification

## Project Overview

**Application Name:** Vict Management (Retail/Stock Management System)  
**Tech Stack:** React 18, Vite, React Router, Axios, Chart.js  
**Type:** Single Page Application (SPA)

This project is an **existing application** that requires both **refactoring of the current codebase** and **implementation of new features**. The developer will be working with a production backend API.

---

## Part 1: Codebase Refactoring (Priority: High)

Before implementing new features, the codebase needs significant improvements for maintainability and scalability.

### 1.1 Code Architecture Improvements

| Task | Description | Estimated Effort |
|------|-------------|------------------|
| **API Service Layer** | Extract all API calls from components into centralized service files (`/services/api/`) | Medium |
| **Environment Variables** | Move hardcoded API URLs to `.env` configuration | Low |
| **State Management** | Implement React Context or Zustand for global state (auth, user, business context) | Medium-High |
| **Custom Hooks** | Extract reusable logic into hooks (`useAuth`, `usePagination`, `useSearch`, `useApi`) | Medium |
| **Component Splitting** | Break down large components (Dashboard.jsx ~2000 lines) into smaller, focused components | High |

### 1.2 Authentication Refactoring

| Task | Description |
|------|-------------|
| Create `AuthContext` provider | Centralized auth state across all components |
| Create `useAuth` hook | Login, logout, token refresh, user data access |
| Protected Route wrapper | Route-based access control component |
| Automatic token refresh | Refresh token before expiration |
| Role-based component guards | Show/hide UI elements based on user role |

### 1.3 UI/UX Improvements

| Task | Description |
|------|-------------|
| Loading states | Consistent skeleton loaders across all data-fetching components |
| Error boundaries | Graceful error handling with user-friendly messages |
| Toast notifications | Replace status messages with a proper toast system |
| Form validation | Implement consistent form validation (consider React Hook Form) |
| Responsive design audit | Ensure all screens work on mobile/tablet |

### 1.4 Code Quality

| Task | Description |
|------|-------------|
| TypeScript migration (optional but recommended) | Add type safety to reduce bugs |
| ESLint/Prettier cleanup | Fix existing linting warnings |
| Remove dead code | Clean up unused variables, functions, imports |
| CSS consolidation | Consider CSS modules or styled-components |

---

## Part 2: New Features Implementation

### 2.1 Authentication & Onboarding Flow

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **OTP Verification Screen** | Enter 6-digit OTP after login/signup, resend OTP button with countdown timer | High |
| **Google OAuth Button** | "Sign in with Google" on login/signup pages | Medium |
| **Email/Phone Verification Screen** | Prompt unverified users to verify before proceeding | High |
| **Business Onboarding Screen** | After first login, guide user to create their business | High |

**UX Flow:**
```
Signup → Enter Details → OTP Sent → Verify OTP → Create Business → Dashboard
Login → Enter Credentials → OTP Sent → Verify OTP → Select Business (if multiple) → Dashboard
```

### 2.2 Business & Multi-tenancy

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **Business Selector** | Dropdown/modal to switch between businesses (for users who are members of multiple) | High |
| **Create Business Screen** | Form with business name, description, address, logo upload | High |
| **Business Settings Screen** | Edit business info, view QR code, manage settings | Medium |
| **Join Business Screen** | Scan QR code or enter code to join existing business | Medium |

**Key UI Elements:**
- Business QR code display with download option
- Business context indicator in header (which business you're currently viewing)

### 2.3 Team/Member Management

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **Team Members List** | Table/list of all business members with role, status, join date | High |
| **Invite Member Modal** | Form to add new member by email/phone with role selection | High |
| **Member Details/Edit** | View and edit individual member (change role, deactivate) | Medium |

**Role Selector UI:**
- Visual role cards showing: Manager, Cashier, Stock Keeper, Delivery
- Permission preview for each role
- Only Owner can assign Manager role

### 2.4 Customer Management

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **Customers List Screen** | Searchable, filterable table of all customers | High |
| **Add/Edit Customer Modal** | Form: name, phone, email, address, customer type (Regular/Wholesaler) | High |
| **Customer Detail Screen** | Customer info + purchase history + credit balance | Medium |

### 2.5 Credit Management System

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **Credits Overview Screen** | List of all outstanding credits with filters (status, overdue) | High |
| **Credit Detail View** | Credit info, payment history, record payment button | High |
| **Record Payment Modal** | Amount input, payment method selector | High |
| **Overdue Credits Alert Panel** | Dashboard widget showing overdue credits | Medium |

**Status UI:**
- Visual badges: Pending (yellow), Partially Paid (blue), Settled (green), Overdue (red)
- Overdue indicator with days overdue count

### 2.6 Finance/Expense Management

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **Expenses List Screen** | Table with filtering by type, date range, payment method | High |
| **Add/Edit Expense Modal** | Expense type selector, amount, payee info, payment method, justification | High |
| **Expense Categories** | Visual cards for expense types (Rent, Salary, Utilities, etc.) | Medium |

**Expense Types to Display:**
- Replenishment, Electricity, Water, Salary, Rent, Marketing, Insurance, Transport, Office Supplies, etc.

### 2.7 Salary Management (Owner/Manager Only)

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **Salaries Overview** | List of employees with current salary, payment status | Medium |
| **Salary History** | Per-employee salary records over time | Low |
| **Pay Salary Modal** | Record salary payment | Medium |
| **Promote Employee Modal** | Change role + update salary | Low |

### 2.8 Enhanced Inventory Features

**Screens Required:**

| Screen | Description | Priority |
|--------|-------------|----------|
| **Stock Movements Screen** | Log of all stock in/out/adjustments | High |
| **Record Stock Movement Modal** | Movement type, product, quantity, reason | High |
| **Barcode Scanner Interface** | Camera-based barcode scanning for product lookup | Medium |
| **Expired Products Screen** | Filtered view of expired/near-expiry products | Medium |

### 2.9 Enhanced Invoice/POS Features

**Existing improvements needed:**

| Feature | Description | Priority |
|---------|-------------|----------|
| **Barcode scanning during sale** | Quick product add via camera/scanner | Medium |
| **Customer selection in invoice** | Link invoice to existing customer or quick-add new customer | High |
| **Payment method icons** | Visual selector for Cash, Card, Mobile Money, etc. | Low |
| **Invoice receipt view** | Clean, printable receipt format with QR code | Medium |

### 2.10 Dashboard Enhancements

**New Widgets/Sections:**

| Widget | Description | Priority |
|--------|-------------|----------|
| **Daily Summary Card** | Today's revenue, orders, profit at a glance | High |
| **Overdue Credits Alert** | Count and total amount of overdue credits | Medium |
| **Cashier Performance** | Sales by cashier (Owner view only) | Low |
| **Quick Actions Panel** | Shortcuts to common tasks (New Sale, Add Product, etc.) | Medium |

---

## Part 3: Role-Based Access Control (RBAC) UI

### Permission Matrix Implementation

The UI must show/hide features based on user role:

| Feature | Owner | Manager | Cashier | Stock Keeper |
|---------|-------|---------|---------|--------------|
| Dashboard (full) | ✅ | ❌ | ❌ | ❌ |
| Dashboard (limited) | - | ✅ | ✅ | ✅ |
| Manage Members | ✅ | ✅ | ❌ | ❌ |
| Manage Managers | ✅ | ❌ | ❌ | ❌ |
| Products CRUD | ✅ | ✅ | ❌ | ✅ |
| Stock Movements | ✅ | ✅ | ❌ | ✅ |
| Create Invoice | ✅ | ✅ | ✅ | ❌ |
| Cancel/Delete Invoice | ✅ | ✅ | ❌ | ❌ |
| View Expenses | ✅ | ✅ | ❌ | ❌ |
| Manage Expenses | ✅ | ✅ | ❌ | ❌ |
| Delete Business | ✅ | ❌ | ❌ | ❌ |
| View Customers | ✅ | ✅ | ✅ | ❌ |
| Manage Credits | ✅ | ✅ | ✅ | ❌ |
| Generate Reports | ✅ | ✅ | ✅* | ✅* |

*Sales reports for Cashier, Inventory reports for Stock Keeper

**Implementation:**
- Create `usePermissions` hook
- Wrap restricted components with permission checks
- Show "Access Denied" view for unauthorized access
- Hide sidebar menu items based on role

---

## Part 4: Navigation Structure

### Updated Sidebar Menu

```
📱 Vict Management

├── 🏠 Home
├── 📊 Dashboard
├── 💰 Sales
│   ├── Invoices
│   └── POS
├── 📦 Inventory
│   ├── Products
│   ├── Categories
│   └── Stock Movements
├── 👥 Customers
│   ├── All Customers
│   └── Credits
├── 💵 Finance (Owner/Manager)
│   ├── Expenses
│   └── Salaries
├── 👤 Team (Owner/Manager)
├── 📈 Reports
├── ⚙️ Settings
│   ├── Business Settings
│   └── Profile
└── 🔔 Notifications
```

---

## Part 5: UI/UX Design Guidelines

### Design System

| Element | Guideline |
|---------|-----------|
| **Color Scheme** | Dark theme (current), accent colors for status indicators |
| **Status Colors** | Success: Green, Warning: Yellow/Orange, Error: Red, Info: Blue |
| **Typography** | Maintain current font hierarchy |
| **Spacing** | Consistent 8px grid system |
| **Cards** | Rounded corners, subtle shadows, clear hierarchy |
| **Tables** | Alternating row colors, sticky headers, responsive |
| **Forms** | Clear labels, placeholder text, validation feedback |
| **Buttons** | Primary (solid), Secondary (outline), Destructive (red) |

### Mobile Responsiveness

All screens must be usable on:
- Mobile phones (320px - 480px)
- Tablets (768px - 1024px)
- Desktops (1024px+)

**Key considerations:**
- Collapsible sidebar on mobile
- Stack form fields vertically on mobile
- Horizontal scroll for wide tables OR card view alternative
- Touch-friendly tap targets (min 44px)

---

## Part 6: Deliverables Checklist

### Phase 1: Refactoring 
- [ ] API service layer setup
- [ ] Environment configuration
- [ ] Auth context and protected routes
- [ ] Component splitting (Dashboard, Products, Invoice)
- [ ] Custom hooks extraction

### Phase 2: Core Features 
- [ ] OTP verification flow
- [ ] Business creation/selection
- [ ] Customer management screens
- [ ] Credit management screens
- [ ] Stock movements

### Phase 3: Advanced Features 
- [ ] Finance/Expense management
- [ ] Salary management
- [ ] Enhanced POS with barcode scanning
- [ ] Team member management
- [ ] Dashboard enhancements

### Phase 4: Polish 
- [ ] RBAC implementation across all screens
- [ ] Mobile responsiveness audit
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Final testing and bug fixes

---

## Technical Notes for Developer

### API Base URL
```
Production: https://victbackendmanagement.onrender.com/api/v1/
```

### Authentication
- JWT tokens stored in localStorage
- Include `Authorization: Bearer <token>` header
- Refresh token on 401 responses
- Clear storage on logout

### Key API Endpoints to Integrate
| Feature | Endpoint Pattern |
|---------|------------------|
| Auth | `/auth/*` |
| Business | `/businesses/*` |
| Members | `/businesses/{id}/members/*` |
| Products | `/products/*` |
| Categories | `/inventory/{business_id}/categories/*` |
| Invoices | `/sales/*` |
| Customers | `/customers/*` |
| Credits | `/customers/{id}/credit/*` |
| Expenses | `/finance/*` |
| Reports | `/reports/*` |
| Notifications | `/notifications/*` |

### Existing Dependencies (package.json)
- React 18
- React Router DOM
- Axios
- Chart.js + react-chartjs-2
- Lucide React (icons)
- React Icons
- date-fns

---

## Contact & Support

- **API Documentation:** Available at `/api/docs/` (Swagger)
- **Backend Team:** [Add contact info]
- **Design Assets:** [Add link to Figma/design files if available]

---

*This specification is a living document. Requirements may be adjusted based on project progress and stakeholder feedback.*
