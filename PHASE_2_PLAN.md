# Phase 2: Lending Features
## Daily Finance Management System (SaaS)

**Status:** Ready to begin  
**Date:** 8 November 2026  
**Duration:** 2-3 weeks estimated

---

## Phase 2 Goals

Build complete loan and disbursement management with flexible repayment scheduling.

---

## Features to Implement

### 1. **Loan Products** (Backend + Frontend)
   - Accountant can create loan products (terms, interest rates, duration)
   - Define lending products once, use for multiple loans
   - Fields:
     - Product name
     - Interest rate / Total repayment amount
     - Minimum/Maximum principal
     - Default duration (days)
     - Status (active/inactive)

### 2. **Loan Management** (Backend + Frontend)
   - **Create loan:**
     - Select customer
     - Enter principal amount
     - Enter held amount (business capital)
     - System calculates: disbursed amount = principal - held
     - Select loan product
     - Review repayment schedule
   
   - **Loan details screen:**
     - All loan information
     - Repayment schedule view
     - Payment history
     - Outstanding balance tracking
   
   - **Loan states:**
     - Draft (not approved)
     - Approved (ready to disburse)
     - Active (disbursed, collecting)
     - Closed (completed or settled early)

### 3. **Repayment Schedule** (Backend)
   - Generate installment schedule based on:
     - Principal amount
     - Duration (collection days)
     - Collection frequency (daily/weekly/monthly - per loan)
     - Collection calendar (skip non-collection days)
     - Grace period handling (flexible)
   
   - Schedule fields (per installment):
     - Due date (calculated from collection calendar)
     - Scheduled amount
     - Status (upcoming/due/overdue/paid/partial)
     - Amount paid
     - Remaining due

### 4. **Disbursement** (Backend + Frontend)
   - **Disbursement record:**
     - Principal amount
     - Held amount (moved to "Held for Collateral" account)
     - Disbursed amount (sent to customer)
     - Disbursement date
     - Disbursement method (cash/bank/UPI)
   
   - **Ledger entries on disbursement:**
     - Debit: Cash account (for held amount)
     - Credit: "Held for Collateral" account
     - Debit: Cash account (for disbursed amount)
     - Credit: Loan Principal account
   
   - **Held amount tracking:**
     - Visible in account balance
     - Separate from available cash
     - Released on loan closure

### 5. **Collector Assignment** (Backend + Frontend)
   - **Assign collectors to customers:**
     - One customer can have multiple collectors
     - All collectors see that customer's data
     - Collectors can only see assigned customers
   
   - **Update assignments:**
     - Add/remove collectors
     - Accountant manages all assignments

### 6. **Database Schema** (Backend)

**New Models:**
- `LoanProduct` - Lending products/terms
- `Loan` - Loan agreements
- `LoanSchedule` - Individual installments
- `Disbursement` - Actual disbursement records
- `Account` - Cash/bank/UPI accounts
- `CustomerCollectorAssignment` - Collector-customer mapping
- `LedgerTransaction` - Financial events (accounts)

**Schema changes:**
- `customers` table - add status, verification fields
- `users` table - relationships to customer assignments
- `audit_logs` - track all loan operations

---

## API Endpoints

### Loan Products
```
POST   /api/loan-products          # Create product (accountant only)
GET    /api/loan-products          # List products
GET    /api/loan-products/:id      # Get product details
PUT    /api/loan-products/:id      # Update product (accountant only)
```

### Loans
```
POST   /api/loans                  # Create loan (accountant only)
GET    /api/loans                  # List loans (filtered by company)
GET    /api/loans/:id              # Get loan details + schedule
PUT    /api/loans/:id              # Update loan (before disbursement)
POST   /api/loans/:id/approve      # Approve loan (accountant only)
POST   /api/loans/:id/disburse     # Disburse loan (create disbursement)
POST   /api/loans/:id/close        # Close loan (early settlement)
GET    /api/loans/:id/schedule     # Get repayment schedule
```

### Disbursements
```
POST   /api/disbursements          # Create disbursement (create on disburse)
GET    /api/disbursements          # List disbursements
GET    /api/disbursements/:id      # Get disbursement details
```

### Collector Assignments
```
POST   /api/customers/:id/assign-collectors     # Assign collectors to customer
GET    /api/customers/:id/collectors            # Get assigned collectors
DELETE /api/customers/:id/collectors/:collector # Remove collector
```

### Accounts
```
POST   /api/accounts               # Create cash/bank account
GET    /api/accounts               # List accounts
GET    /api/accounts/:id           # Get account balance
GET    /api/accounts/:id/transactions  # Get transaction history
```

---

## Frontend Pages

### 1. **Loan Products Management**
   - List of products
   - Create/Edit product modal
   - Activate/Deactivate products

### 2. **Loan Workflow**
   - **Create Loan** (multi-step form):
     1. Select customer
     2. Enter principal & held amount
     3. Select product
     4. Review schedule
     5. Confirm & create
   
   - **Loan Details Page:**
     - All loan info
     - Repayment schedule (table)
     - Payment history
     - Outstanding balance
     - Action buttons (approve, disburse, close, edit)
   
   - **Loan List Page:**
     - Filterable by status
     - Search by customer code/name
     - Bulk status indicators
     - Quick actions

### 3. **Accounts Management**
   - Add cash/bank/UPI accounts
   - View account balance (including held amount separately)
   - Transaction history per account
   - Dashboard widget showing all accounts

### 4. **Collector Assignment**
   - Customer details page: show assigned collectors
   - Quick "Assign collectors" button
   - Multi-select modal to add/remove collectors

---

## Testing Scenarios

1. **Loan Creation with Held Amount**
   - Create loan: Principal ₹50,000, Held ₹5,000
   - Verify disbursed amount = ₹45,000
   - Verify schedule based on full principal (₹50,000)

2. **Flexible Schedule Generation**
   - Daily collection, skip Sundays
   - Weekly collection on Mondays
   - Monthly collection on 1st
   - Verify dates calculated correctly

3. **Held Amount Tracking**
   - On disbursement: held amount moved to "Held for Collateral"
   - Dashboard shows: Available Cash vs. Held for Collateral
   - On closure: held amount released to cash

4. **Collector Assignments**
   - Assign multiple collectors to one customer
   - Verify all collectors see customer
   - Verify collectors restricted to assigned customers

5. **Account Management**
   - Multiple accounts (cash, bank, UPI)
   - Balances updated on disbursement
   - Ledger entries created

6. **Authorization**
   - Accountant: full access
   - Collector: read-only for assigned customers
   - Verify API denies unauthorized access

---

## Development Order

### Backend (Week 1)
1. Create LoanProduct model & routes
2. Create Loan model & routes (create, approve, disburse, close)
3. Create LoanSchedule generation logic
4. Create Disbursement model & logic
5. Create Account model & ledger entries
6. Create CustomerCollectorAssignment model
7. API authorization checks per role
8. Comprehensive backend tests

### Frontend (Week 1-2)
1. Loan products management UI
2. Loan creation workflow (multi-step)
3. Loan list & details pages
4. Account management UI
5. Collector assignment UI
6. Integration with backend APIs
7. Form validation & error handling
8. Loading states & error messages

### Testing & Fixes (Week 2-3)
1. End-to-end testing
2. Bug fixes
3. Performance optimization
4. Security audit
5. Documentation

---

## Success Criteria

- ✅ Owner can create loan products
- ✅ Owner can create loans with principal + held amount
- ✅ Repayment schedule generated correctly
- ✅ Loan can be disbursed (ledger entries created)
- ✅ Held amount tracked separately in accounts
- ✅ Multiple collectors can be assigned to customers
- ✅ Collectors can only see assigned customers
- ✅ All CRUD operations logged in audit_logs
- ✅ API authorization working for all endpoints
- ✅ End-to-end loan creation & disbursement flow working

---

## Next Steps

1. Start backend: LoanProduct model & routes
2. Create Loan model & schedule generation
3. Implement disbursement logic
4. Build frontend forms & pages
5. Test end-to-end flow

Ready to build Phase 2! 🚀
