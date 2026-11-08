import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/connection';
import authRoutes from './routes/auth.routes';

// Import all models to initialize them
import './models/Company';
import './models/User';
import './models/AuditLog';
import './models/Customer';
import './models/LoanProduct';
import './models/Loan';
import './models/LoanSchedule';
import './models/Disbursement';
import './models/Account';
import './models/Payment';
import './models/PaymentAllocation';
import './models/CustomerCollectorAssignment';
import './models/Expense';
import './models/DailyClosing';
import './models/LedgerTransaction';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (basic)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Phase 2 Routes
import customerRoutes from './routes/customer.routes';
import loanProductRoutes from './routes/loan-product.routes';
import loanRoutes from './routes/loan.routes';
import paymentRoutes from './routes/payment.routes';
import accountRoutes from './routes/account.routes';
import userRoutes from './routes/user.routes';

// Phase 3 Routes
import collectionRoutes from './routes/collection.routes';

// Phase 4 Routes
import reportRoutes from './routes/report.routes';
import expenseRoutes from './routes/expense.routes';
import dailyClosingRoutes from './routes/daily-closing.routes';

app.use('/api/customers', customerRoutes);
app.use('/api/loan-products', loanProductRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/daily-closing', dailyClosingRoutes);

// Health check
app.get('/health', (_req: Request, _res: Response) => {
  _res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
