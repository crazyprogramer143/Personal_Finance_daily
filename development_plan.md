# Development Plan
## Daily Finance Management System (SaaS)

**Status:** Ready for implementation  
**Version:** 1.0  
**Date:** 8 November 2026

---

## 1. Project Structure (Monorepo)

```
daily-finance-saas/
├── frontend/                 # React + TypeScript
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page screens (Dashboard, Reports, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls, auth service
│   │   ├── types/          # TypeScript types/interfaces
│   │   ├── utils/          # Helper functions
│   │   ├── context/        # React Context (Auth, Company)
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── .env.example
│
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models/schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── types/          # TypeScript types/interfaces
│   │   ├── utils/          # Helper functions
│   │   ├── database/       # Database connection, migrations
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── jest.config.js      # Testing config
│
├── docs/                   # Documentation
│   ├── API.md             # API endpoint documentation
│   ├── DATABASE.md        # Database schema
│   └── COLLECTOR_AUTH.md  # Collector authorization flow
│
├── .gitignore
├── package.json           # Root package (if monorepo with workspaces)
└── README.md
```

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 18.x |
| | TypeScript | 5.x |
| | State Management | Context API or Redux |
| | HTTP Client | Axios or Fetch |
| | UI Framework | Tailwind CSS or Material-UI |
| | Build Tool | Vite or Create React App |
| **Backend** | Node.js | 18.x LTS |
| | Framework | Express.js |
| | Language | TypeScript |
| | Database | PostgreSQL 14+ |
| | ORM | Sequelize or Prisma |
| | Validation | Joi or Zod |
| | Authentication | JWT (Bearer token) |
| | Hashing | bcrypt |
| **DevOps** | Testing (Backend) | Jest + Supertest |
| | Testing (Frontend) | Jest + React Testing Library |
| | Linting | ESLint + Prettier |
| | Version Control | Git |

---

## 3. Collector Authorization System

### 3.1 Database Structure

```sql
-- Companies (tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP
);

-- Users (Owner/Accountant/Collector)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    username VARCHAR(255),           -- Nullable for owners (use email)
    email VARCHAR(255),              -- For owners only
    password_hash VARCHAR(255),
    role ENUM('accountant', 'collector') NOT NULL,
    created_at TIMESTAMP,
    UNIQUE(company_id, username)     -- Username unique per company
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    code VARCHAR(50) NOT NULL,       -- C001, C002, etc.
    name VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP,
    UNIQUE(company_id, code)         -- Code unique per company
);

-- Collector-Customer Assignments
CREATE TABLE collector_customer_assignments (
    id UUID PRIMARY KEY,
    collector_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    assigned_at TIMESTAMP,
    UNIQUE(collector_id, customer_id)
);
```

### 3.2 Authorization Flow

#### **Login Layer:**

```typescript
// Backend: /auth/login
POST /api/auth/login
{
  "username": "john_c",      // Collector
  "password": "***"
}
OR
{
  "email": "owner@company.com", // Owner/Accountant
  "password": "***"
}

Response:
{
  "token": "eyJhbGc...",        // JWT token
  "userId": "uuid-...",
  "companyId": "uuid-...",
  "role": "collector",
  "assignedCustomers": ["c-uuid-1", "c-uuid-2", ...]  // Only for collectors
}
```

#### **JWT Token Payload:**

```typescript
{
  "userId": "uuid-collector-1",
  "companyId": "uuid-company-1",
  "role": "collector",
  "assignedCustomers": ["c-uuid-1", "c-uuid-2"],  // For quick client-side checks
  "exp": 1234567890,
  "iat": 1234567800
}
```

### 3.3 Authorization Checks (Backend)

**Every API request should have these checks:**

#### **1. Company Context Check**
```typescript
// Middleware: validateCompanyAccess()
// Verify token's companyId matches the resource's companyId
// ALL queries should filter by: WHERE company_id = req.user.companyId
```

#### **2. Collector-Customer Access Check**
```typescript
// Middleware: validateCustomerAccess()
// If user is COLLECTOR:
//   - Check if customer.company_id === req.user.companyId
//   - Check if collector_customer_assignments exists for this pair
// If user is ACCOUNTANT:
//   - Check if customer.company_id === req.user.companyId (full access)
```

#### **3. Example API Flows:**

**COLLECTOR accessing customer data:**
```
GET /api/customers/:customerId
├─ Check: token.companyId === customer.company_id ✓
├─ Check: Is collector in collector_customer_assignments for this customer? ✓
└─ Allow access to customer data
```

**COLLECTOR trying to access customer they're NOT assigned to:**
```
GET /api/customers/:differentCustomerId
├─ Check: token.companyId === customer.company_id ✓
├─ Check: Is collector assigned to this customer? ✗
└─ Return 403 Forbidden
```

**COLLECTOR trying to access customer from different company:**
```
GET /api/customers/:customerId (from different company)
├─ Check: token.companyId === customer.company_id? ✗
└─ Return 403 Forbidden
```

**ACCOUNTANT accessing any customer in their company:**
```
GET /api/customers/:customerId
├─ Check: token.companyId === customer.company_id ✓
├─ Check: Role is accountant? ✓
└─ Allow full access (no need to check assignments)
```

### 3.4 Role-based API Access

| Endpoint | Accountant | Collector | Check |
|---|---|---|---|
| `GET /customers` | All (filtered by company) | Only assigned (filtered by company) | Company + Assignment |
| `GET /customers/:id` | All in company | Only assigned | Company + Assignment |
| `POST /customers` | ✓ Create | ✗ Forbidden | Role check |
| `PUT /customers/:id` | ✓ Edit | ✗ Forbidden | Role check |
| `GET /loans` | All in company | Only assigned customers' loans | Company + Assignment |
| `POST /payments` | ✓ Record | ✓ Record (only assigned customers) | Company + Assignment |
| `GET /payments` | All in company | Only their payments + assigned customers | Company + Assignment |
| `PUT /settings` | ✓ Manage | ✗ Forbidden | Role check |
| `GET /users` | ✓ View all collectors | ✗ Forbidden | Role check |
| `POST /users` | ✓ Create collector | ✗ Forbidden | Role check |

### 3.5 Frontend Authorization

```typescript
// Frontend: Restrict UI based on role + assignments
// This is UX only; backend enforces actual authorization

// In component:
if (user.role === 'accountant') {
  // Show all management options
  return <AccountantDashboard />;
} else if (user.role === 'collector') {
  // Show only collection screen for assigned customers
  return <CollectorCollectionScreen 
    assignedCustomers={user.assignedCustomers} 
  />;
}
```

### 3.6 Authorization Middleware (Backend Example)

```typescript
// middleware/auth.middleware.ts

export const validateCompanyContext = (req, res, next) => {
  // Extract company_id from request (path param or body)
  const requestedCompanyId = req.params.companyId || req.body.companyId;
  
  // Check token's companyId matches
  if (req.user.companyId !== requestedCompanyId) {
    return res.status(403).json({ error: 'Access denied: Company mismatch' });
  }
  
  next();
};

export const validateCollectorCustomerAccess = async (req, res, next) => {
  const customerId = req.params.customerId;
  const userId = req.user.userId;
  const companyId = req.user.companyId;
  
  // Get customer
  const customer = await Customer.findByPk(customerId);
  
  // Check company match
  if (customer.company_id !== companyId) {
    return res.status(403).json({ error: 'Customer not found or not in your company' });
  }
  
  // If collector, check assignment
  if (req.user.role === 'collector') {
    const assignment = await CollectorCustomerAssignment.findOne({
      where: { collector_id: userId, customer_id: customerId, company_id: companyId }
    });
    
    if (!assignment) {
      return res.status(403).json({ error: 'Access denied: Not assigned to this customer' });
    }
  }
  
  // If accountant, full access (company check already passed)
  
  next();
};
```

---

## 4. Phase-wise Development Breakdown

### **PHASE 1: Foundation + Company Setup**

#### **Backend:**
- [x] Setup Express.js + TypeScript
- [x] Database connection (PostgreSQL)
- [x] Models: Company, User (owner/collector), AuditLog
- [x] Routes: Company signup, login (email for owner, username for collector)
- [x] Auth middleware: JWT validation, company context check
- [x] Services: AuthService, CompanyService
- [x] Password hashing & validation
- [x] Error handling & logging
- [x] Unit tests for auth flow

#### **Frontend:**
- [x] Setup React + TypeScript + Vite
- [x] Login page (email for owner, username for collector)
- [x] Company signup page (email-based registration)
- [x] Context: AuthContext (store user, token, company info)
- [x] Protected routes (redirect to login if not authenticated)
- [x] Basic layout (sidebar navigation stub)
- [x] Responsive design (mobile + desktop)

#### **Database:**
- [x] Schema: companies, users, audit_logs tables
- [x] Indexes on company_id, email, username
- [x] Foreign key constraints

#### **Deliverables:**
- [x] Owner can register → login
- [x] Owner can create collector accounts (username + password)
- [x] Collector can login with username
- [x] JWT tokens working for both login types
- [x] Company data isolation at DB level
- [x] Basic audit logging

---

### **PHASE 2: Lending (Loans & Schedules)**

#### **Backend:**
- [x] Models: LoanProduct, Loan, LoanSchedule, Disbursement
- [x] Routes:
  - `POST /loans/products` — Create loan product (accountant only)
  - `GET /loans/products` — List loan products (company-filtered)
  - `POST /loans` — Create loan (accountant only)
  - `GET /loans` — List loans (accountant sees all, collector sees assigned customers' loans)
  - `GET /loans/:id` — Loan details with authorization check
  - `PUT /loans/:id` — Update loan (accountant only)
  - `POST /loans/:id/disburse` — Disburse loan (record principal, held, disbursed)
  - `GET /loans/:id/schedule` — Repayment schedule
- [x] Services: LoanService, ScheduleService (generate repayment schedule)
- [x] Repayment calculation logic (flexible by loan)
- [x] Disbursement logic (track principal, held, disbursed amounts)
- [x] Ledger entries for disbursement
- [x] Validation: held_amount <= principal
- [x] Authorization: Only accountant can create/modify loans
- [x] Database transactions for disbursement

#### **Frontend:**
- [x] Pages:
  - Loan list (with customer code, principal, held, disbursed, outstanding)
  - Create loan (wizard: customer → principal → held amount → product → review → disburse)
  - Loan details (show all amounts, schedule)
  - Repayment schedule view
- [x] Components: LoanForm, ScheduleTable, DisbursementSummary
- [x] Validation: Held amount <= principal (client-side + server-side)

#### **Database:**
- [x] Models: loan_products, loans, loan_schedules, disbursements
- [x] Fields: principal, held_amount, disbursed_amount
- [x] Foreign keys: loan → customer, loan → company
- [x] Indexes: company_id, customer_id, loan_status

#### **Deliverables:**
- [x] Accountant can create loans with principal + held amount
- [x] System generates repayment schedule
- [x] Disbursement records principal, held, disbursed amounts
- [x] Collector can view assigned customer loans (read-only)
- [x] Ledger entries created for held amount movements

---

### **PHASE 3: Collections + Daily Operations**

#### **Backend:**
- [x] Models: Payment, PaymentAllocation, Account, LedgerTransaction
- [x] Routes:
  - `GET /collections/today` — Today's due list (collector sees assigned, accountant sees all)
  - `POST /payments` — Record payment (validate customer access)
  - `GET /payments/:customerId` — Payment history (with authorization)
  - `PUT /payments/:id/reverse` — Reverse payment
  - `POST /daily-closing` — Create daily closing record
  - `GET /daily-closing/:date` — Closing details
  - `PUT /daily-closing/:id/finalize` — Finalize closing
- [x] Services: PaymentService (allocate to installments, handle partial/advance payments)
- [x] Flexible payment allocation (partial, advance, multiple installments)
- [x] Grace period handling (schedule adjusts with actual payment dates)
- [x] Held amount tracking in accounts
- [x] Idempotency control (prevent duplicate payments)
- [x] Authorization: Collectors can only record payments for assigned customers
- [x] Database transactions for payment + allocation

#### **Frontend:**
- [x] Pages:
  - Collections screen (collector-focused, mobile-optimized)
  - Today's due list with search (by code, name, phone)
  - Payment entry form (quick: customer → amount → method → record)
  - Payment history
  - Daily closing review
- [x] Components: PaymentForm, DueListTable, CollectionStatus, SearchBar
- [x] Mobile layout: Large buttons, minimal scrolling, quick entry
- [x] Duplicate prevention: Show if already paid today

#### **Database:**
- [x] Models: payments, payment_allocations, accounts, ledger_transactions
- [x] Ledger entries for: collection (debit cash, credit principal recovered)
- [x] Payment method: cash, UPI, bank_transfer
- [x] Foreign keys: payment → loan, payment_allocation → schedule_installment

#### **Deliverables:**
- [x] Collector can record payments for assigned customers only
- [x] Flexible payment handling (partial, advance, multiple installments)
- [x] Payment allocations adjust upcoming schedule
- [x] Held amount visible in account balance
- [x] Daily closing prepares summary (expected vs. collected)
- [x] Idempotency: Duplicate payment attempts rejected
- [x] Accountant can reverse payments with reason

---

### **PHASE 4: Reports + Hardening**

#### **Backend:**
- [x] Routes:
  - `GET /reports/daily-collection` — Today's collection summary
  - `GET /reports/expected-vs-actual` — Scheduled vs. collected
  - `GET /reports/outstanding` — Principal outstanding by customer
  - `GET /reports/overdue` — Overdue accounts
  - `GET /reports/customer-statement/:customerId` — All loans, payments, balance
  - `GET /reports/loan-statement/:loanId` — Loan details with payment history
  - `GET /reports/cashbook` — Cash in/out, balance
  - `GET /reports/accounts` — Account-wise balances
  - `GET /reports/expenses` — Expense summary
  - `GET /reports/profitability` — Realized income - expenses = profit
  - `GET /reports/collector-performance` — Collections by collector
  - `GET /audit-logs` — Audit trail (searchable, filterable)
- [x] Services: ReportService (calculate metrics with proper business logic)
- [x] Authorization: Collectors see only their data; accountants see all
- [x] Financial calculations: Separate principal, held, disbursed, recovered

#### **Frontend:**
- [x] Pages:
  - Reports dashboard (tabs: Daily, Customer, Loans, Financial, Analytics)
  - Each report with filters (date range, customer, collector, account, status)
  - Sortable columns
  - View on-screen (no export)
  - Recent activities feed (timeline of actions)
  - User management panel (for accountant): list collectors, reset password, disable
- [x] Components: ReportTable, ActivityFeed, CollectorCard
- [x] Responsive tables (horizontal scroll on mobile)

#### **Database:**
- [x] Audit log complete: All CRUD operations logged with user, timestamp, previous/new values
- [x] Indexes optimized for report queries

#### **Deliverables:**
- [x] Accountant sees all reports with full data
- [x] Collector sees only personal collection report
- [x] Financial metrics correctly calculated (no mixing principal/held/disbursed)
- [x] Audit trail complete and searchable
- [x] User management: Reset password, disable collectors
- [x] All reports view on-screen only

---

### **PHASE 5: Language + Mobile UX (Future)**

#### **Backend:**
- [ ] Multi-language support (English, Tamil) — mostly UI strings
- [ ] No backend changes needed (data stored in user-entered language)

#### **Frontend:**
- [ ] Language toggle (English / Tamil)
- [ ] i18n setup (react-i18next)
- [ ] All UI strings translated
- [ ] Collector mobile app optimization (if separate build needed)

#### **Deliverables:**
- [ ] UI in English and Tamil
- [ ] Customer data in user-entered language

---

## 5. Development Workflow

### **Per Phase:**

1. **Backend First:**
   - Define API endpoints (with authorization checks)
   - Implement database models
   - Write services & business logic
   - Add API tests (Jest + Supertest)
   - Document API (Postman/Swagger optional)

2. **Frontend Next:**
   - Design components
   - Integrate with API
   - Add validation (client-side)
   - Write component tests
   - Manual testing

3. **Both:**
   - Integration testing (end-to-end flows)
   - Security review
   - Performance testing
   - Bug fixes

### **Git Workflow:**

```bash
main (stable)
  └─ develop (integration)
      ├─ feature/auth-phase1
      ├─ feature/loans-phase2
      ├─ feature/collections-phase3
      ├─ feature/reports-phase4
      └─ bugfix/...
```

---

## 6. Authorization Quick Reference

### **Key Rules:**

1. **Company Context:** Every query filters by `company_id` from JWT token
2. **Collector Assignment:** Before accessing customer data, check `collector_customer_assignments`
3. **Accountant Bypass:** Accountants bypass assignment checks (but company_id check always applies)
4. **Role Check:** Some endpoints only allow accountant role (no collector access)
5. **Frontend Restriction:** UI hides features based on role; backend enforces actual authorization

### **Middleware Stack (per request):**

```
1. validateToken()              → Extract companyId, userId, role from JWT
2. validateCompanyContext()    → Ensure companyId matches resource
3. validateCollectorAccess()   → Check assignment if collector
4. (Endpoint handler)           → Process request
```

---

## 7. Testing Strategy

### **Backend Tests:**

- **Unit Tests:** Services (PaymentService, LoanService, etc.)
- **Integration Tests:** API endpoints with database
- **Authorization Tests:** Collector access, company isolation
- **Payment Logic Tests:** Partial payments, advance payments, grace periods

### **Frontend Tests:**

- **Component Tests:** Forms, tables, modals
- **Integration Tests:** Login flow, collections flow
- **Authorization Tests:** Role-based UI visibility

### **Manual Testing:**

- Full phase workflow before moving to next phase
- Cross-browser testing
- Mobile responsiveness
- Collector field testing (simulated scenarios)

---

## 8. Deployment

**Initial:** Single server deployment (not SaaS multi-cloud yet)

```
├─ Frontend: Built React app (static files)
├─ Backend: Node.js server (containerized)
├─ Database: PostgreSQL (with automated backups)
└─ Reverse Proxy: Nginx (frontend + API routing)
```

---

## Next Steps

1. ✅ Finalize this dev plan
2. ⬜ Create detailed API documentation
3. ⬜ Design database schema (ER diagram)
4. ⬜ Setup project repositories & CI/CD
5. ⬜ Start Phase 1 development
