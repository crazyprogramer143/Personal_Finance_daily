# Daily Finance Management System
## Product Planning Document

**Status:** Initial planning draft  
**Version:** 0.1  
**Date:** 7 November 2026

---

## 1. Product overview

The goal is to build a web application to manage a small daily-collection lending business.

The business workflow is:

1. Provide a loan to a shop owner or small-business customer.
2. Record the loan agreement and repayment terms.
3. Generate a repayment schedule.
4. Collect payments daily, weekly, or monthly, depending on the agreed product.
5. Track payments, outstanding balances, overdue amounts, expenses, and cash.
6. Monitor the overall financial position of the business.

The application should answer:

> How much money have I invested, how much have I collected, how much is still outstanding, how much cash is available, and what earnings have actually been realized?

This document is a planning baseline. Business rules, legal requirements, and financial calculations must be validated before implementation.

## 2. Goals and non-goals

### Goals

- **Multi-company SaaS platform** — Each company/owner registers with unique email; isolated data per company.
- Maintain customer and shop information with unique customer codes.
- Record loan agreements and disbursements.
- Generate and manage repayment schedules (flexible by loan).
- Record full, partial, advance, and late payments.
- Track overdue installments and outstanding balances.
- Maintain cash, bank, and UPI transaction records.
- Track operating expenses.
- Provide daily closing and reconciliation.
- Manage company owner and collector accounts.
- Maintain user permissions and a complete audit trail.

### Initial non-goals

Avoid building these in the first release unless the business requires them:

- Microservices and distributed architecture.
- Complex AI features.
- Native Android/iOS applications.
- Automated bank integrations.
- Automated credit scoring.

## 3. Business rules — Finalized

These decisions are fixed for the initial version:

| Area | Decision |
|---|---|
| **Platform model** | **Multi-company SaaS** — Each company registers independently; data isolated per company |
| **Company registration** | Email-based; one email = one company account; different company = different email required |
| **User login methods** | Owner: email + password; Collector: username + password (unique per company) |
| **Owner capabilities** | Create, edit, disable collectors; reset collector passwords without requiring old password or collector approval |
| **Collection frequency** | Per-customer per-loan basis (daily, weekly, or monthly as agreed for each loan) |
| **Collection days** | Marked per day — flexible, can define which days are collection days |
| **Grace period** | Flexible — customers may pay next day or later; schedule adjusts based on actual payment timing |
| **Partial payment** | Yes — partial payments allowed, adjusted across upcoming days |
| **Advance payment** | Yes — customers can pay future installments early |
| **Multiple loans** | Yes — one customer can have multiple active loans |
| **Early closure** | Yes — owner/accountant can edit settlement amount at closure time |
| **Collectors** | Accountant role has collection access; collector role limited to assigned customers; one customer can have multiple collectors |
| **Payment methods** | All accepted: cash, UPI, bank transfer (collector selects at entry) |
| **Locations** | One location per company for now |
| **Receipts** | None — no PDF or printed receipts initially |
| **Languages** | English and Tamil based on user preference; customer data in user's entered language |
| **Customer identifier** | Unique customer code per company for easy identification |

Do not assume that a sample repayment rate or collection arrangement is legally permissible. Have the lending model reviewed by a qualified local professional before lending.

## 4. Core modules

### 4.1 Dashboard

Show an at-a-glance view of:

- **Total principal (across all active loans).**
- **Total held amount (business capital in collateral).**
- **Total disbursed amount (actual cash given to customers).**
- Principal outstanding.
- Contractual repayment balance.
- Today's expected collection.
- Today's collected amount.
- Today's pending amount.
- Overdue amount and overdue accounts.
- **Cash balance (excluding held amount).**
- **Cash held for collateral (held amounts).**
- Bank and UPI balances.
- Expenses.
- Realized income and profit, using clearly defined accounting rules.

**Critical:** Do not combine:
- Principal outstanding vs. contractual balance vs. cash available vs. profit — they represent different things.
- Cash held for collateral should NOT be shown as available business cash.
- Disbursed amount (what customer received) vs. principal (what customer must repay).

### 4.2 Company management

Each company operates independently with isolated data:

- **Company registration** — Email-based signup; one email = one company.
- **Company owner (Accountant role)** — Full access to company settings and all operational features.
- **Collector management** — Owner can:
  - Create new collector accounts with username.
  - Edit collector details and permissions.
  - Reset collector passwords anytime without requiring old password or collector approval.
  - Disable/enable collectors.
  - View collector activity and audit logs.
- **Data isolation** — Customers, loans, payments, and accounts are isolated per company.
- **Username uniqueness** — Collector username must be unique within a company (not globally).

### 4.3 Customer management

A customer profile may contain:

- **Customer code** — unique identifier for easy reference (e.g., C001, C002).
- Customer ID — system-generated unique ID.
- Customer name (in user's entered language).
- Mobile number.
- Shop/business name (in user's entered language).
- Business type.
- Shop address (in user's entered language).
- Assigned collectors (one customer can have multiple collectors).
- Customer status.
- Loan history.
- Payment history.
- Current outstanding amounts.

Collect only information that is necessary for the business and legally permitted. Customer data stored in the language entered by the user; language preference noted for reporting.

### 4.4 Loan management

A loan record should include:

| Field | Example | Description |
|---|---|---|
| Loan ID | LN-0001 | System-generated unique ID |
| Customer | Kumar Stores | Linked customer |
| **Principal (Total amount)** | ₹50,000 | Total principal the customer commits to repay |
| **Held Amount** | ₹5,000 | Business's own capital held as collateral/security |
| **Disbursed Amount** | ₹45,000 | Actual amount given to customer (Principal - Held Amount) |
| Total scheduled repayment | ₹60,000 | Total customer must repay (includes interest/fees on disbursed amount) |
| Duration | 100 collection days | Collection period |
| Scheduled installment | ₹600 | Per-collection amount |
| Start date | 1 November 2026 | Loan activation date |
| End date | Based on calendar & rules | Final due date |
| Status | Draft / Approved / Active / Closed | Loan lifecycle |

**Important:**
- **Principal** = Held Amount + Disbursed Amount
- **Customer repays** based on the full Principal (not just disbursed amount)
- **Held Amount** is business capital, tracked separately in accounts
- **Disbursed Amount** is the actual cash/UPI/bank transfer to the customer
- All three must be tracked separately in financial reports

The figures are illustrative only, not a recommended lending rate or legal structure.

Loan workflow:

1. Select or register a customer.
2. Enter the proposed principal and **held amount** (business capital).
3. System calculates **disbursed amount** = Principal - Held Amount.
4. Select an approved repayment product/terms.
5. Generate the repayment schedule (based on full principal).
6. Review the schedule and disclosures.
7. Record approval and agreement.
8. Record actual disbursement:
   - **Held Amount:** Moved from business cash to "Held for Collateral" account (ledger entry)
   - **Disbursed Amount:** Cash/UPI/bank transfer to customer (ledger entry)
9. Activate the loan.

**Key points:**
- Customer repays the full **Principal** amount.
- **Held Amount** stays in business accounts (not disbursed to customer).
- **Disbursed Amount** is what customer receives and must repay.
- On loan closure, **Held Amount** is released back to business cash.
- All three amounts (Principal, Held, Disbursed) must be trackable separately.

Once disbursed, preserve the original agreement terms. Changes should be represented by a formal modification or rescheduling record, with the reason, approval, effective date, and audit history.

### 4.5 Repayment schedule

Create an installment schedule for each loan.

Each installment should track:

- Due date.
- Scheduled amount.
- Amount allocated.
- Remaining due.
- Status: upcoming, due, partially paid, paid, overdue, waived/reversed where permitted.

The schedule must account for collection days, holidays, grace periods, rescheduling, and early settlement rules.

### 4.6 Daily collections

The collection screen should let an authorized user:

1. View installments due today (based on loan-specific collection schedule).
2. Search by customer code, customer name, shop, or phone number.
3. Open a customer/loan record.
4. Enter the amount received.
5. Select payment method: **Cash, UPI, or Bank Transfer**.
6. Record a reference number where applicable.
7. Save the payment.

Support:

- Full payment.
- Partial payment (adjusted across upcoming days).
- Payment covering multiple installments.
- Advance payment.
- Late payment.
- Reversal/correction with reason and approval.

**Collector restrictions:** Collector role can only record collections for their assigned customers. If a customer has multiple collectors, all can see the customer details.

Never silently overwrite or delete a financial payment. Preserve the original event and record reversals or adjustments.

### 4.7 Cashbook and accounts

Track money movement across:

- Physical cash.
- Bank accounts.
- UPI or payment accounts.
- Other approved business accounts.

Record:

- Loan disbursements.
- Customer collections.
- Business expenses.
- Deposits and withdrawals.
- Transfers between the business's own accounts.
- Refunds and reversals.

Transfers between the business's own accounts must not be counted as income or expenses.

### 4.8 Expenses

Record operating expenses such as:

- Travel and fuel.
- Staff salaries or collection fees.
- Rent.
- Phone and internet.
- Printing and stationery.
- Other approved expenses.

Each expense should have a date, category, amount, payment account, description, creator, and supporting attachment where appropriate.

### 4.9 Reports (Phase 4 onwards)

Reports to add after core functionality is stable:

- Daily collection report.
- Expected versus collected report.
- Pending and overdue installment report.
- Customer statement.
- Loan statement.
- Disbursement report.
- Principal recovery report.
- Cashbook and account statement.
- Expense report.
- Loan closure report.
- Daily closing report.
- Profitability report with clearly documented assumptions.

*Note: No PDF receipts. Reports are viewed on-screen; export to common formats (CSV, Excel) if needed later.*

### 4.10 Users and permissions

**Authentication:**
- **Owner/Accountant login:** Email + password (company-level access)
- **Collector login:** Username + password (within the company)

**Two roles defined per company:**

| Role | Permissions | Login method |
|---|---|---|
| **Accountant (Owner)** | Full access: manage all customers, create/modify loans, view all operations, manage settings, manage collectors, record collections, daily closing | Email + password |
| **Collector** | Limited access: view only assigned customers; if customer has multiple collectors, all can view that customer's details; record payments for assigned customers only | Username + password |

**Owner/Accountant specific capabilities:**
- Create, edit, and disable collector accounts
- Reset collector passwords anytime without requiring old password or collector approval
- View collector activity logs
- Configure company settings
- Assign collectors to customers

**Collector restrictions:**
- Cannot alter loan terms, delete payments, or modify customer details
- Can only record collections for assigned customers
- Cannot access company settings or manage other collectors

**Username uniqueness:** Collector username must be unique within a company (not globally across all companies).

### 4.11 CRUD Operations requirement

Every entity must support full CRUD (Create, Read, Update, Delete) operations:

| Module | Operations | Examples |
|---|---|---|
| **Customers** | Create, Read, Update, Disable/Delete | Add customer, view profile, edit details, mark as inactive |
| **Collectors** | Create, Read, Update, Disable | Create username, view collector details, reset password, disable account |
| **Loan Products** | Create, Read, Update, Disable | Define lending terms, view product, modify interest, retire old products |
| **Loans** | Create, Read, Update (limited), Close | Create loan, view details, modify (with audit), close/settle early |
| **Loan Schedules** | Read, Update (reschedule), View history | View schedule, reschedule if approved, see modification history |
| **Payments** | Create, Read, Update (correction), Reverse | Record payment, view history, correct entry (with audit), reverse if needed |
| **Disbursements** | Create, Read, View held/disbursed tracking | Disburse loan, view disbursement details, track held vs. disbursed |
| **Accounts** | Create, Read, Update (settings), View transactions | Add cash/bank account, view balance, update details, see transaction history |
| **Expenses** | Create, Read, Update, Delete (with audit) | Record expense, view expense list, edit category/amount, delete (tracked in audit) |
| **Daily Closing** | Create, Read, Review, Finalize | Prepare closing, review discrepancies, finalize for the day |

**Key requirements:**
- All Create/Update/Delete operations must be audited (who, when, what changed, why).
- All operations require proper role-based authorization.
- Read operations must be company-scoped and collector-scoped where applicable.
- Soft deletes (mark as inactive/deleted with timestamp) preferred over hard deletes.
- Update operations should show previous values for comparison.

### 4.12 Audit logs

Record important actions for all CRUD operations:

- Who created, edited, or deleted a customer.
- Who created, edited, or closed a loan.
- Who approved and disbursed a loan (with principal, held, disbursed amounts).
- Who recorded, reversed, or corrected a payment.
- Who adjusted or rescheduled an installment.
- Who created, edited, or deleted a collector account.
- Who changed a schedule or modified loan terms.
- Who performed daily closing.
- When the action happened (timestamp).
- **Previous and new values** for all changes.
- **Reason and approval details** for sensitive changes (e.g., early settlement discount).
- User who performed the action (owner, collector, accountant).
- **Amount details** for financial transactions (principal, held, disbursed, payment amount).

## 5. Key workflows

### 5.1 Customer registration

```text
New customer
    |
Enter required details
    |
Verify details and required documents
    |
Review eligibility and policy
    |
Approve or reject
    |
Customer profile becomes available
```

A customer and a loan must be separate records. A customer may have multiple loans over time.

### 5.2 Loan creation and disbursement

```text
Select customer
    |
Enter principal and approved terms
    |
Generate repayment schedule
    |
Review agreement and disclosures
    |
Approval
    |
Record actual disbursement
    |
Activate loan
```

Do not treat an approved loan as disbursed until the actual transfer of funds is recorded.

### 5.3 Daily collection

```text
Open today's collection list
    |
Select customer and loan
    |
Enter amount received
    |
Select payment method/account
    |
Validate and save payment
    |
Allocate payment to installments
    |
Update balances and status
    |
Generate receipt
```

### 5.4 End-of-day closing

The closing process should show:

- Total amount expected.
- Total amount collected.
- Full and partial payments.
- Missed and pending installments.
- Cash collections.
- UPI collections.
- Bank collections.
- Expenses paid.
- Cash expected on hand.
- Actual cash counted.
- Difference and explanation.
- Person who prepared and approved the closing.

## 6. Financial model and accounting principles

Financial calculations must be specified before coding.

For example, if the principal is ₹50,000 and the scheduled total repayment is ₹60,000, the application must not immediately record ₹10,000 as collected profit. The customer has not yet paid that amount.

Define and report separately:

| Metric | Meaning |
|---|---|
| **Principal (Total)** | Total principal committed by customer to repay |
| **Held Amount (Total)** | Business's own capital held as collateral across all loans |
| **Disbursed Amount** | Actual cash/UPI/bank given to customers (Principal - Held Amount per loan) |
| Principal disbursed | Total of all disbursed amounts actually paid to customers |
| Principal outstanding | Total principal still unpaid by all customers |
| Cash collected | Payments actually received from customers |
| Principal recovered | Amount allocated to principal recovery (reducing principal outstanding) |
| Held amount recovered | When held amount is released back to business (on loan closure) |
| Contractual balance | Remaining amount under the repayment agreement |
| Overdue amount | Amount past due under the schedule |
| Realized income | Income recognized under the chosen accounting policy |
| Held amount in accounts | Business cash reserved/held for collateral (separate ledger entry) |
| Available cash | Business cash that is not held for collateral |
| Expenses | Business operating costs |
| Net profit | Income less applicable expenses and losses |

Important cases to define:

- Partial payments.
- Payments covering multiple installments.
- Advance payments.
- Early loan settlement.
- Rescheduling.
- Refunds.
- Reversed or mistaken payments.
- Waivers, if legally and operationally permitted.
- Defaults and bad-debt treatment.
- Collection fees and other charges.
- Rounding and currency precision.

### Ledger recommendation

Use an immutable financial transaction ledger or a properly designed double-entry accounting ledger.

Do not calculate the entire business's financial position from the current values in the loan table alone.

Every financial event should be traceable to its source document and transaction. Use database transactions to keep related updates consistent.

### Money representation

Use `DECIMAL(15,2)` or integer paise for monetary values. Never use floating-point types for financial amounts.

## 7. Database design: initial entities

**Multi-company SaaS structure:**

| Entity | Responsibility |
|---|---|
| **Company** | Company registration; email-based; isolated data |
| **User** | Login and user identity (email for owners, username for collectors) |
| **Role** | Permission grouping (Accountant, Collector per company) |
| **UserRole** | User-to-role assignment |
| **UserCompanyAssignment** | Maps users to companies (for multi-company support if owner has multiple companies) |
| **Customer** | Customer profile (unique within a company) |
| **CustomerDocument** | Verification documents, if required |
| **CustomerCollectorAssignment** | Maps customers to collectors within a company |
| **LoanProduct** | Approved lending product and terms |
| **Loan** | Loan agreement and lifecycle |
| **LoanSchedule** | Individual scheduled installments |
| **LoanModification** | Approved changes to loan terms |
| **Disbursement** | Actual money given to the customer |
| **Payment** | Actual payment received |
| **PaymentAllocation** | Allocation of payments to installments/principal/charges |
| **Account** | Cash, bank, or payment account (per company) |
| **LedgerTransaction** | Financial event |
| **LedgerEntry** | Debit/credit entries if using double-entry accounting |
| **Expense** | Business expense |
| **DailyClosing** | End-of-day reconciliation |
| **AuditLog** | Historical user actions (per company) |

**Held Amount tracking:**
- Disbursement record tracks: **principal_amount**, **held_amount**, **disbursed_amount**
  - `disbursed_amount = principal_amount - held_amount`
- **Account entries for held amount:**
  - On disbursement: Debit "Cash" or payment account, Credit "Held for Collateral" (held_amount)
  - On disbursement: Debit "Held for Collateral", Credit "Cash", Debit "Loan Disbursement" (disbursed_amount to customer)
  - On loan closure: Debit "Cash", Credit "Held for Collateral" (release held amount back)
- Repayment schedule and payments are based on full **principal_amount**, not just disbursed_amount.

Potential relationships:

- One customer can have many loans.
- One loan can have many schedule installments.
- One loan can have one or more disbursement records (tracks principal, held, disbursed amounts).
- One loan can have many payments.
- One payment can have multiple payment allocations.
- One installment can be settled through multiple payment allocations.
- One account can have many financial transactions (including held amount movements).

This is a starting model. Finalize constraints, indexes, foreign keys, and lifecycle rules during detailed database design.

## 8. Workbench Design

### 8.1 Navigation Structure

**Left sidebar tabs (all users):**
1. **Dashboard** — Overview and quick actions
2. **Reports** — Analytics and detailed reports
3. **Recent Activities** — Activity logs and user management
4. **Settings** — Configuration and account management

**Additional modules (accessible from Dashboard or side menu):**
- Customers
- Loans
- Collections
- Accounts
- Expenses

---

### 8.2 DASHBOARD Tab

#### **Owner/Accountant View:**

**Top Section — Key Metrics (At-a-glance):**
- Total Principal (across all loans)
- Total Held Amount (collateral)
- Total Disbursed (active)
- Principal Outstanding
- Overdue Amount
- **Cash Available** (excluding held amount)
- **Cash Held for Collateral**
- Today's Expected Collection
- Today's Collected (Live counter)

**Quick Actions Row:**
```
[+ Create Loan] [+ Add Customer] [+ Record Payment] [+ Add Expense] [Daily Closing]
```

**Today's Collection Widget:**
- Customers due today (count)
- Collected so far (₹ amount)
- Pending collection (₹ amount)
- Collection status: Not started / In Progress / Completed

**Business Snapshot (Tabs within Dashboard):**

| Tab | Content |
|---|---|
| **Today** | Expected vs. collected, pending, overdue count |
| **This Week** | Collection trend, overdue aging |
| **This Month** | Principal recovery rate, collection efficiency, expense summary |
| **Active Loans** | Total, outstanding, at-risk loans (overdue > 3 days) |
| **Collectors** | Performance: collections by collector, active today |
| **Cash Accounts** | Cash on hand, bank balance, UPI balance, held amount |

**Alerts/Flags (if any):**
- High overdue amount
- Large cash discrepancy in daily closing
- Collector inactive today

---

#### **Collector View:**

**Top Section — My Collections (Today):**
- My assigned customers count
- Due today (count + names/codes)
- Already collected (₹ amount)
- Still pending (₹ amount)
- Collection status: Not started / In Progress / Completed

**Quick Actions Row:**
```
[Search Customer] [Record Payment] [View My Customers] [View My History]
```

**Today's Due List (Primary focus):**

| Column | Data |
|---|---|
| Customer Code | C001, C002, etc. |
| Customer Name | Name (Tamil/English as set) |
| Loan ID | LN-0001 |
| Due Amount | ₹600 |
| Status | Pending / Paid (green checkmark) |
| Phone | Quick call/message |
| Last Paid | Date |
| Actions | [Pay Now] [View Details] |

**Search Bar (Prominent):**
- Search by: Customer Code, Customer Name, Phone Number
- Filter: All / Pending / Paid Today

**My Performance (Bottom widget):**
- Collections today: ₹X / ₹Y (percentage)
- Customers visited: X / Y
- Payment success rate: Z%
- Last sync time (if offline)

---

### 8.3 REPORTS Tab

#### **Owner/Accountant View:**

**Report Categories (Tabs):**

| Category | Reports | Details |
|---|---|---|
| **Daily Operations** | Daily Collection Report | Who collected what, cash/UPI/bank split |
| | Expected vs. Actual | Scheduled vs. collected, variance |
| | Pending & Overdue | Customers not paid today, overdue aging |
| **Customer & Loans** | Customer Statement | All loans, payments, balances for one customer |
| | Loan Statement | Principal, held, disbursed, payments, outstanding |
| | Disbursement Report | All active disbursements with held/disbursed breakdown |
| | Principal Recovery | Principal recovered vs. outstanding over time |
| **Financial** | Cashbook | Cash in, cash out, cash on hand |
| | Bank & UPI Accounts | Account-wise transactions and balances |
| | Expense Report | Expense categories, amounts, trends |
| | Profitability | Revenue (realized income) - Expenses = Profit |
| **Analytics** | Collector Performance | Collections by collector, efficiency metrics |
| | Loan Closure | Closed loans, early settlement discounts |
| | Overdue Analysis | Oldest overdue accounts, overdue trend |

**Each Report:**
- Date range selector (Today / This Week / This Month / Custom)
- Filters: Customer, Collector, Loan Product, Account, Status
- Sortable columns
- View on-screen (no export; DB backups handle data retrieval)

---

#### **Collector View:**

**My Reports (Limited):**
- My Daily Collection Report (today only)
- My Customer List with due/paid status
- My Payment History
- (No financial/expense reports)

---

### 8.4 RECENT ACTIVITIES Tab

#### **Owner/Accountant View:**

**Activity Feed (Timeline format):**

| Timestamp | User | Action | Details |
|---|---|---|---|
| 14:32 | Collector A | Payment Recorded | Customer C001, ₹600, Cash |
| 14:15 | Collector B | Payment Reversal | LN-0002, -₹300, Reason: Duplicate |
| 13:45 | You | Loan Created | Customer C005, Principal ₹40,000 |
| 13:20 | You | Collector Added | Username: john_c, Assigned to 5 customers |
| 13:10 | System | Daily Closing | Prepared by: You, ₹5,000 discrepancy |
| 12:50 | Collector A | Collector Login | IP: 192.168.1.1 |

**Filters:**
- All / Payments / Loans / Collectors / Settings
- User: All / Specific collector / You
- Date range: Today / This Week / This Month / Custom
- Search: Free text search

**User Management Panel (within Recent Activities):**

| Collector | Status | Last Login | Assigned Customers | Actions |
|---|---|---|---|---|
| Collector A | Active | Today 10:30 AM | 15 | [View] [Edit] [Reset Password] [Disable] |
| Collector B | Active | Today 02:15 PM | 10 | [View] [Edit] [Reset Password] [Disable] |
| Collector C | Inactive | 3 days ago | 8 | [View] [Edit] [Reset Password] [Enable] |

**Actions in User Management:**
- [+ Add New Collector]
- [Reset Password] — No old password needed
- [Edit] — Change name, assignments, permissions
- [Disable/Enable] — Activate or deactivate account
- [View Activity] — See their transactions

---

#### **Collector View:**

**My Activity (Read-only):**
- Personal payments recorded today
- Payment history (last 30 days)
- Login history
- (No other user activity visible)

---

### 8.5 SETTINGS Tab

#### **Owner/Accountant View:**

**Sub-tabs/Sections:**

| Section | Options |
|---|---|
| **Company Settings** | Company name, email, phone, address, business type |
| **Collection Calendar** | Mark non-collection days (Sundays, holidays, custom dates) |
| **Loan Products** | Add/Edit lending products and terms |
| **Accounts** | Add/Edit cash, bank, UPI accounts |
| **Business Rules** | Grace period settings, payment adjustment rules |
| **Language** | UI language preference (English / Tamil) |
| **My Profile** | Name, email, password change |
| **Audit Logs** | View full audit trail (searchable, filterable) |

**Each section:**
- [Save Changes] button
- Confirmation dialogs for critical changes
- Timestamp of last change + who changed it

---

#### **Collector View:**

**Limited Settings:**
- **My Profile** — Username, password change (can change own password)
- **Language** — UI language preference (English / Tamil)
- (No company or business settings access)

---

### 8.6 Sub-modules (Accessible from Dashboard)

#### **Customers Module:**

**Owner view:**
- [+ Add Customer] button
- Customer list with filters (Active/Inactive, Assigned collector)
- Search by code, name, phone
- Actions: [View] [Edit] [Assign Collectors] [View Loans] [View Payments]

**Collector view:**
- View only assigned customers
- Search by customer code, name, phone
- Actions: [View Details] [Record Payment]

---

#### **Loans Module:**

**Owner view:**
- [+ Create Loan] button
- Loan list with filters (Active/Closed, Overdue)
- Columns: Loan ID, Customer, Principal, Held Amount, Disbursed Amount, Outstanding, Status
- Actions: [View] [Edit Terms] [Disburse] [Early Settlement] [Close]

**Collector view:**
- View assigned customer's loans only
- Read-only access to loan details

---

#### **Collections Module (Primary for Collectors):**

**For Collectors — Optimized for mobile & speed:**

```
┌─────────────────────────────────┐
│ 🔍 Search Customer              │
│    [By Code] [By Name] [By Phone] │
└─────────────────────────────────┘

┌─ TODAY'S DUE CUSTOMERS ──────────┐
│                                  │
│ [C001] Kumar Stores       ₹600   │
│ Due Today | [Pay Now]            │
│                                  │
│ [C002] Raj Shop           ₹800   │
│ 2 days overdue | [Pay Now]       │
│                                  │
│ [C003] Lakshmi Store      ₹600   │
│ Due Today | [Pay Now]            │
│                                  │
│ ▼ Load More                      │
└──────────────────────────────────┘

┌─ PAYMENT ENTRY QUICK FORM ───────┐
│                                  │
│ Customer: [C001] Kumar Stores    │
│ Loan: LN-0001                   │
│ Scheduled Due: ₹600             │
│                                  │
│ Amount Received: [600    ]       │
│ Payment Method: [Cash ▼]         │
│   Options: Cash / UPI / Bank     │
│ Reference: [Ref number...]       │
│                                  │
│ [RECORD PAYMENT]  [CANCEL]       │
│                                  │
└──────────────────────────────────┘

┌─ COLLECTION STATUS ──────────────┐
│ Collected: ₹2000 / ₹5000         │
│ ████████░░░░░░░░░░░░ 40%        │
│ Pending: ₹3000 (5 customers)     │
│ Overdue: ₹1200 (2 customers)     │
└──────────────────────────────────┘
```

**Owner view (Collections report):**
- All collectors' collections
- Today's summary
- Collector-wise breakdown
- Payment method breakdown

---

### 8.7 UI/UX Efficiency Features

**For Collectors (Mobile-first):**

1. **Quick Search** — Search appears first, leads to one-tap payment
2. **Large Touch Targets** — Buttons > 48px for mobile usability
3. **Minimal Scrolling** — Show due customers in viewport, paginate
4. **One-Tap Pay** — Pre-fill customer details, select amount, one button to pay
5. **Offline Readiness** — Cache customer list and due amounts (Phase 5)
6. **Visual Status** — Green checkmark = paid, Red = overdue, Yellow = due today
7. **Quick Sync** — Manual sync button for offline entries
8. **Duplicate Prevention** — Show "Already paid ₹600 today at 14:30" if collector tries again

**For Owner (Desktop-first, but mobile-responsive):**

1. **Dashboard at a glance** — All key metrics without scrolling
2. **Quick Actions** — Top row buttons for common tasks
3. **Advanced Filters** — Detailed report filtering
4. **Sortable Tables** — Click column headers to sort
5. **Export Options** — CSV, Excel for analysis
6. **Dark/Light Mode** — Toggle if needed
7. **Keyboard Shortcuts** — Power users can use shortcuts (optional Phase 2)
8. **Two-step Verification** — For critical actions (daily closing, early settlement)

**General (Both):**

1. **Breadcrumb Navigation** — Show current location
2. **Back Button** — Easy navigation
3. **Confirmation Dialogs** — For destructive actions
4. **Success/Error Messages** — Clear feedback
5. **Loading States** — Show progress for long operations
6. **Responsive Design** — Works on mobile (375px) to desktop (1920px)
7. **Language Toggle** — Switch between English & Tamil anytime
8. **Accessibility** — ARIA labels, keyboard navigation, high contrast

---

### 8.8 Mobile vs. Desktop Layouts

| Feature | Mobile (Collector) | Desktop (Owner) |
|---|---|---|
| Navigation | Bottom tab bar or left hamburger | Top/left sidebar always visible |
| Collections screen | Full screen, simplified form | Panel + detailed list |
| Dashboard metrics | Stacked vertically | Grid/cards layout |
| Tables | Horizontal scroll or cards | Full table with pagination |
| Modals | Full screen | Center modal (400-600px) |
| Font size | 16px base (readable) | 14px base (more info density) |

---

### 8.9 Login & Role-based Home Screen

**Owner/Accountant Login:**
- Email + Password
- Home → Dashboard tab (default)

**Collector Login:**
- Username + Password
- Home → Collections (Today's due list, optimized for payment recording)

**Different starting points ensure efficiency for each role.**

## 9. Technical architecture

Recommended initial stack:

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| UI | Responsive component system (mobile-optimized for collectors) |
| Backend | Java + Spring Boot |
| API | REST |
| Database | PostgreSQL |
| Database migrations | Flyway |
| Authentication | Secure session or token-based authentication |
| Language support | English and Tamil (UI labels, customer data in entered language) |
| Testing | JUnit, integration tests, frontend tests |
| Deployment | Managed server/container platform |
| Backups | Automated database backups and restore testing |

### Architecture approach

Start with a modular monolith with **multi-tenancy support** (row-level isolation per company).

Suggested backend modules:

```text
auth (company + user login)
companies (company management)
users (collector account management)
customers
loan-products
loans
schedules
collections
payments
accounts
ledger
expenses
reports
audit
notifications
```

**Multi-tenancy strategy:**
- Company ID as tenant identifier
- All queries filtered by company context
- Database-level isolation via foreign keys
- No shared customer/loan/payment data across companies

Avoid microservices, Kafka, and unnecessary infrastructure in the first version. Keep module boundaries clear so the application can evolve later.

### Important engineering requirements

**CRUD operations:**
- Every entity must support **Create, Read, Update, Delete** operations with proper authorization.
- Examples: Customers (add, edit, view, disable/delete); Loans (create, view, modify, close); Collectors (create, edit, disable); Payments (record, view, reverse/delete with audit).
- All changes must be audited with timestamp, user, previous value, and new value.
- Soft deletes preferred over hard deletes (mark as deleted/disabled with timestamp).

**Financial integrity:**
- Use database transactions for payment recording, allocation, and held amount movements.
- Prevent duplicate payment submissions with idempotency controls.
- Track held amount separately: created on disbursement, released on loan closure.
- Validate held amount <= principal before creating loan.

**Security and compliance:**
- Enforce authorization on the backend, not only in the UI.
- Validate all financial inputs server-side.
- Use secure password hashing and secure session/token handling.
- Encrypt sensitive data where appropriate.
- Keep secrets out of source control.
- Maintain audit logs for all CRUD operations.
- Back up data and test restoration.
- Use HTTPS.
- Monitor application errors and failed jobs.
- Define data retention and deletion policies.
- Consider offline collection only after designing safe synchronization and duplicate prevention.

## 10. Legal, regulatory, and privacy review

The intended lending model and business structure must be reviewed before the business operates.

For a Tamil Nadu business, investigate the applicability of:

- Tamil Nadu money-lending legislation and registration requirements.
- Applicable interest-rate and fee restrictions.
- Required loan documentation and disclosures.
- Receipt, ledger, and record-keeping requirements.
- Rules governing collection practices and customer communications.
- RBI requirements if the structure involves a regulated entity or digital lending arrangement.
- Applicable personal-data protection requirements, including the DPDP framework.

The exact obligations depend on the legal structure and activity. Consult a qualified Tamil Nadu lawyer and CA. Do not assume that building an app or calling the activity a private finance business removes licensing or registration requirements.

Design the product to support transparent terms, accurate receipts, customer statements, secure data handling, and lawful collection practices. Do not build coercive collection, contact scraping, public shaming, or unauthorized access to customer devices.

## 11. MVP roadmap

### Phase 1 — Foundation + Company setup

- Company registration (email-based signup, data isolation).
- Authentication (email-based for owners, username-based for collectors).
- Roles and permissions (two-role model per company).
- Owner/Accountant capabilities: create, edit, disable collectors; reset passwords.
- Customer management with unique customer codes.
- Company business settings.
- Audit log foundation (per company).

### Phase 2 — Lending

- Loan products and approved terms.
- Loan creation with flexible per-loan collection frequency.
- Repayment schedule generation (supporting flexible grace periods and partial payments).
- Approval workflow.
- Disbursement records.
- Loan detail and statement views.

### Phase 3 — Collections

- Today's due list (based on loan-specific schedules).
- Full and partial payments.
- Payment allocation (flexible adjustment across upcoming days).
- Payment reversals.
- Cashbook and account balances (Cash, UPI, Bank).
- Daily closing and reconciliation.
- Collector-assigned-customer view (multiple collectors per customer support).
- Advance payment support.

### Phase 4 — Reports and hardening

- Dashboard.
- Outstanding and overdue reports.
- Customer and loan statements.
- Expense management and reports.
- Profitability reports.
- Backup and restore tests.
- Security and permission testing.
- Pilot with a small, controlled set of records.

### Phase 5 — Language and UX refinement

- Tamil and English interface (user preference based).
- Collector-specific mobile-optimized experience.
- Customer data display in user-entered language.

### Later releases (if business expands)

- WhatsApp or SMS reminders, subject to consent and applicable rules.
- Offline collection with safe synchronization.
- Advanced analytics.
- Multi-branch support.

## 12. Testing scenarios

At minimum, test these before real use:

**Core scenarios:**
- Customer has no loan.
- Customer has multiple loans.
- Loan is approved but not disbursed.

**Disbursement with held amount:**
- Loan with held amount (e.g., ₹50,000 principal, ₹5,000 held, ₹45,000 disbursed).
- Verify held amount moved to "Held for Collateral" account.
- Verify disbursed amount sent to customer (cash/UPI/bank).
- Verify repayment schedule based on full principal (₹50,000), not disbursed (₹45,000).
- Verify held amount released on loan closure.
- Verify "Available cash" excludes held amounts.

**Loan and payment scenarios:**
- Loan is disbursed and schedule is active.
- Full installment payment.
- Partial installment payment (adjusted to upcoming days).
- One payment covers multiple installments.
- One installment is paid through multiple payments.
- Duplicate payment request (rejected).
- Payment is reversed (with audit trail).
- Payment is received after the due date.
- Advance payment (covers future installments).
- Early settlement (held amount released).
- Schedule rescheduling.
- Holiday and non-collection day (skipped in schedule).

**Collector and authorization:**
- Collector attempts an unauthorized action (denied).
- Collector can only see assigned customers.
- One customer with multiple collectors (all see customer details).
- Two collectors attempt to record the same payment (second one rejected or flagged).
- Owner resets collector password without old password.

**Cashbook and accounts:**
- Daily cash closing with held amount discrepancy.
- Held amount correctly reflected in available vs. held cash.
- Ledger entries for disbursement (held + disbursed amounts).
- Ledger entries for held amount release.

**Audit and CRUD:**
- Customer CRUD operations logged with previous/new values.
- Collector password change logged (without storing password).
- Loan modification tracked (what changed, who approved).
- Payment reversal audited with reason.
- All deletions marked as soft-deletes with timestamp.

**Company isolation:**
- Two companies with different customers (no data leakage).
- Same collector username in different companies (allowed).
- Company owner can manage only their collectors.

**Database:**
- Database backup is restored successfully.
- All held amount data restored correctly.
- All audit logs intact after restoration.

## 13. Remaining decisions before implementation

Most foundational decisions are finalized. Remaining items to confirm:

1. **Repayment calculation model** — Define the legally reviewed formula (fixed installments, reducing-balance, etc.).
2. **Collection day calendar** — Define holidays and non-collection days for the first year.
3. **Internet availability** — Confirm whether collectors have reliable internet access during collections.
4. **Early settlement formula** — Define how settlement amounts are calculated when a customer closes early.
5. **Customer verification** — What level of customer verification/documentation is required?
6. **Audit trail depth** — Which specific actions should trigger audit log entries?

## 14. Recommended project execution order

Do not start coding immediately. Follow this sequence:

1. **Business Requirement Document (BRD):** Finalize business operations, terminology, rules, and exceptions.
2. **Product Requirement Document (PRD):** Define user roles, screens, actions, and expected behavior.
3. **Financial specification:** Define repayment, allocation, settlement, accounting, and reconciliation formulas.
4. **Database design:** Create ER diagram, relationships, constraints, and transaction rules.
5. **System design:** Define modules, APIs, authentication, security, and deployment.
6. **UI/UX:** Design dashboard, customer, loan, and collection workflows.
7. **Implementation:** Build one module at a time with automated tests.
8. **Pilot:** Validate the application with test data and a controlled operational trial before relying on it for real money.

---

## First milestone

**Foundational decisions: FINALIZED**

✅ **Platform model** — Multi-company SaaS (email-based company registration, data isolation)  
✅ **Login methods** — Owner/Accountant: email + password; Collector: username + password (unique per company)  
✅ **Owner capabilities** — Create/edit/disable collectors, reset passwords anytime without old password  
✅ Roles — Accountant (full access) and Collector (assigned customers only)  
✅ Collection frequency — Per-loan basis (daily, weekly, monthly as agreed)  
✅ Collection days — Marked per day (flexible)  
✅ Grace period — Flexible (schedule adjusts with actual payments)  
✅ Partial/Advance payments — Both supported  
✅ Multiple loans per customer — Yes  
✅ Payment methods — All (cash, UPI, bank transfer)  
✅ Locations — Single location per company  
✅ Language — English and Tamil (user preference)  
✅ Customer code — Unique identifier per company (e.g., C001)  
✅ No receipts/PDFs — Simplify initial scope  

**Next deliverables (before Phase 1 coding):**

1. **Business Requirement Document (BRD)** — Finalize the 6 remaining decisions (repayment model, collection calendar, settlement formula, etc.).
2. **Initial database ER diagram** — Entities, relationships, constraints, multi-tenancy strategy (company ID as tenant key).
3. **UI wireframes** — Company signup, login flows, collector management, dashboard, customer, loan, and collection workflows (mobile-optimized).
4. **Financial specification** — Define repayment allocation rules, grace period handling, partial payment adjustment logic.
5. **Multi-tenancy design doc** — Row-level security, company context enforcement, data isolation strategy.
