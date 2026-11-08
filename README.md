# Daily Finance Management System (SaaS)

A multi-company SaaS platform for managing daily-collection lending businesses.

## Project Structure

```
daily-finance-saas/
├── backend/          # Node.js + Express + TypeScript
├── frontend/         # React + TypeScript + Vite
├── docs/            # Documentation
└── README.md        # This file
```

## Quick Start

### Prerequisites
- Node.js 18.x LTS or higher
- PostgreSQL 14+
- Git

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Phase 1 Features ✅

### Backend
- ✅ Express.js + TypeScript setup
- ✅ PostgreSQL connection (Sequelize ORM)
- ✅ Models: Company, User, AuditLog
- ✅ Auth routes: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- ✅ JWT authentication
- ✅ Authorization middleware
- ✅ Error handling

### Frontend
- ✅ React + TypeScript + Vite setup
- ✅ Login page (Owner & Collector)
- ✅ Signup page (Company registration)
- ✅ AuthContext for state management
- ✅ Protected routes
- ✅ API client with axios
- ✅ Tailwind CSS styling

## API Endpoints

### Auth
- `POST /api/auth/signup` - Company registration
- `POST /api/auth/login` - Auto-detect owner or collector login
- `POST /api/auth/login/owner` - Owner email login
- `POST /api/auth/login/collector` - Collector username login
- `GET /api/auth/me` - Get current user (requires token)

## Development

### Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Linting
```bash
npm run lint
npm run format
```

## Next Phase (Phase 2)

- Loan products and creation
- Repayment schedules
- Loan disbursement with held amount tracking
- Database models for loans and schedules

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, TypeScript, Sequelize, PostgreSQL, JWT, bcryptjs
- **Database:** PostgreSQL 14+
- **Testing:** Jest (Backend), Vitest (Frontend)

## License

MIT

## Author

crazyprogramer143
