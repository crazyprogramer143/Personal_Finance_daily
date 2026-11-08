"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./database/connection");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// Import all models to initialize them
require("./models/Company");
require("./models/User");
require("./models/AuditLog");
require("./models/Customer");
require("./models/LoanProduct");
require("./models/Loan");
require("./models/LoanSchedule");
require("./models/Disbursement");
require("./models/Account");
require("./models/Payment");
require("./models/PaymentAllocation");
require("./models/CustomerCollectorAssignment");
require("./models/Expense");
require("./models/DailyClosing");
require("./models/LedgerTransaction");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware (basic)
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api/auth', auth_routes_1.default);
// Phase 2 Routes
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const loan_product_routes_1 = __importDefault(require("./routes/loan-product.routes"));
const loan_routes_1 = __importDefault(require("./routes/loan.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const account_routes_1 = __importDefault(require("./routes/account.routes"));
// Phase 3 Routes
const collection_routes_1 = __importDefault(require("./routes/collection.routes"));
// Phase 4 Routes
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const daily_closing_routes_1 = __importDefault(require("./routes/daily-closing.routes"));
app.use('/api/customers', customer_routes_1.default);
app.use('/api/loan-products', loan_product_routes_1.default);
app.use('/api/loans', loan_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/accounts', account_routes_1.default);
app.use('/api/collections', collection_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/daily-closing', daily_closing_routes_1.default);
// Health check
app.get('/health', (_req, _res) => {
    _res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
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
        await (0, connection_1.initializeDatabase)();
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map