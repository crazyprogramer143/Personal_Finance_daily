import axios, { AxiosInstance } from 'axios';
import { AuthResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data on 401
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(email: string, name: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/signup', {
      email,
      name,
      password,
    });
    return response.data;
  }

  async loginOwner(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login/owner', {
      email,
      password,
    });
    return response.data;
  }

  async loginCollector(username: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login/collector', {
      username,
      password,
    });
    return response.data;
  }

  async login(email?: string, username?: string, password?: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', {
      email,
      username,
      password,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Customer endpoints
  async createCustomer(data: any) {
    const response = await this.client.post('/customers', data);
    return response.data;
  }

  async getCustomers() {
    const response = await this.client.get('/customers');
    return response.data;
  }

  async getCustomerDetails(customerId: string) {
    const response = await this.client.get(`/customers/${customerId}`);
    return response.data;
  }

  async updateCustomer(customerId: string, data: any) {
    const response = await this.client.put(`/customers/${customerId}`, data);
    return response.data;
  }

  async deleteCustomer(customerId: string) {
    const response = await this.client.delete(`/customers/${customerId}`);
    return response.data;
  }

  // Loan Product endpoints
  async createLoanProduct(data: any) {
    const response = await this.client.post('/loan-products', data);
    return response.data;
  }

  async getLoanProducts() {
    const response = await this.client.get('/loan-products');
    return response.data;
  }

  async getLoanProductDetails(productId: string) {
    const response = await this.client.get(`/loan-products/${productId}`);
    return response.data;
  }

  async updateLoanProduct(productId: string, data: any) {
    const response = await this.client.put(`/loan-products/${productId}`, data);
    return response.data;
  }

  async deactivateLoanProduct(productId: string) {
    const response = await this.client.post(`/loan-products/${productId}/deactivate`);
    return response.data;
  }

  // Loan endpoints
  async getLoans(params?: { search?: string; status?: string; customerId?: string; collectorId?: string }) {
    const response = await this.client.get('/loans', { params });
    return response.data;
  }

  async createLoan(data: any) {
    const response = await this.client.post('/loans', data);
    return response.data;
  }

  async getLoanDetails(loanId: string) {
    const response = await this.client.get(`/loans/${loanId}`);
    return response.data;
  }

  async getCustomerLoans(customerId: string) {
    const response = await this.client.get(`/loans/customer/${customerId}`);
    return response.data;
  }

  async approveLoan(loanId: string) {
    const response = await this.client.post(`/loans/${loanId}/approve`);
    return response.data;
  }

  async disburseLoan(loanId: string, data: any) {
    const response = await this.client.post(`/loans/${loanId}/disburse`, data);
    return response.data;
  }

  async closeLoan(loanId: string) {
    const response = await this.client.post(`/loans/${loanId}/close`);
    return response.data;
  }

  // Payment endpoints
  async recordPayment(data: any) {
    const response = await this.client.post('/payments', data);
    return response.data;
  }

  async reversePayment(paymentId: string, reason: string) {
    const response = await this.client.post(`/payments/${paymentId}/reverse`, { reason });
    return response.data;
  }

  async getLoanPayments(loanId: string) {
    const response = await this.client.get(`/payments/loan/${loanId}`);
    return response.data;
  }

  async getCollectorPayments(fromDate?: Date, toDate?: Date) {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());
    const response = await this.client.get(`/payments/collector/payments?${params}`);
    return response.data;
  }

  // Account endpoints
  async createAccount(data: any) {
    const response = await this.client.post('/accounts', data);
    return response.data;
  }

  async getCompanyAccounts() {
    const response = await this.client.get('/accounts');
    return response.data;
  }

  async getAccountDetails(accountId: string) {
    const response = await this.client.get(`/accounts/${accountId}`);
    return response.data;
  }

  async recordTransaction(data: any) {
    const response = await this.client.post(`/accounts/${data.accountId}/transactions`, data);
    return response.data;
  }

  async getAccountLedger(accountId: string, limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const response = await this.client.get(`/accounts/${accountId}/ledger?${params}`);
    return response.data;
  }

  async getCompanyLedger(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const response = await this.client.get(`/accounts/company/ledger?${params}`);
    return response.data;
  }

  async holdAmount(accountId: string, amount: number) {
    const response = await this.client.post(`/accounts/${accountId}/hold`, { accountId, amount });
    return response.data;
  }

  async releaseHeldAmount(accountId: string, amount: number) {
    const response = await this.client.post(`/accounts/${accountId}/release`, { accountId, amount });
    return response.data;
  }

  async updateAccountStatus(accountId: string, status: 'active' | 'inactive') {
    const response = await this.client.put(`/accounts/${accountId}/status`, { status });
    return response.data;
  }

  // User/Collector endpoints
  async createCollector(data: { username: string; password: string }) {
    const response = await this.client.post('/users/collectors', data);
    return response.data;
  }

  async getCollectors() {
    const response = await this.client.get('/users/collectors');
    return response.data;
  }

  async deleteCollector(collectorId: string) {
    const response = await this.client.delete(`/users/collectors/${collectorId}`);
    return response.data;
  }

  async getMyAssignedCustomers() {
    const response = await this.client.get('/users/me/assigned-customers');
    return response.data;
  }

  async assignCollector(customerId: string, collectorId: string) {
    const response = await this.client.post(`/customers/${customerId}/assign-collector`, { collectorId });
    return response.data;
  }

  async unassignCollector(customerId: string, collectorId?: string) {
    const response = await this.client.post(`/customers/${customerId}/unassign-collector`, { collectorId });
    return response.data;
  }

  // Loan update endpoint
  async updateLoan(loanId: string, data: any) {
    const response = await this.client.put(`/loans/${loanId}`, data);
    return response.data;
  }

  // Collection endpoints
  async getDueSchedules(date?: Date) {
    const params = new URLSearchParams();
    if (date) params.append('date', date.toISOString());
    const response = await this.client.get(`/collections/due-schedules?${params}`);
    return response.data;
  }

  async getCustomerDueLoans(customerId: string) {
    const response = await this.client.get(`/collections/customer/${customerId}/due-loans`);
    return response.data;
  }

  async getCollectionStats(date?: Date) {
    const params = new URLSearchParams();
    if (date) params.append('date', date.toISOString());
    const response = await this.client.get(`/collections/stats?${params}`);
    return response.data;
  }

  async getCollectorPerformance(fromDate: Date, toDate: Date) {
    const params = new URLSearchParams();
    params.append('fromDate', fromDate.toISOString());
    params.append('toDate', toDate.toISOString());
    const response = await this.client.get(`/collections/performance?${params}`);
    return response.data;
  }

  async getOverdueStats() {
    const response = await this.client.get('/collections/overdue-stats');
    return response.data;
  }

  async getCollectorAssignments() {
    const response = await this.client.get('/collections/assignments');
    return response.data;
  }

  async waiverInstallment(scheduleId: string, reason: string) {
    const response = await this.client.post(`/collections/schedules/${scheduleId}/waiver`, {
      reason,
    });
    return response.data;
  }

  async applyGracePeriod(scheduleId: string, graceDays: number, reason: string) {
    const response = await this.client.post(
      `/collections/schedules/${scheduleId}/grace-period`,
      { graceDays, reason }
    );
    return response.data;
  }

  // Report endpoints
  async getCollectionPerformanceReport(fromDate: Date, toDate: Date) {
    const params = new URLSearchParams();
    params.append('fromDate', fromDate.toISOString());
    params.append('toDate', toDate.toISOString());
    const response = await this.client.get(`/reports/collection-performance?${params}`);
    return response.data;
  }

  async getCollectorComparisonReport(fromDate: Date, toDate: Date) {
    const params = new URLSearchParams();
    params.append('fromDate', fromDate.toISOString());
    params.append('toDate', toDate.toISOString());
    const response = await this.client.get(`/reports/collector-comparison?${params}`);
    return response.data;
  }

  async getCustomerCollectionHistoryReport(customerId: string) {
    const response = await this.client.get(`/reports/customer-history/${customerId}`);
    return response.data;
  }

  async getLoanPortfolioReport() {
    const response = await this.client.get('/reports/loan-portfolio');
    return response.data;
  }

  async getOverdueAnalysisReport() {
    const response = await this.client.get('/reports/overdue-analysis');
    return response.data;
  }

  // Expense endpoints
  async createExpense(data: any) {
    const response = await this.client.post('/expenses', data);
    return response.data;
  }

  async getCompanyExpenses(fromDate?: Date, toDate?: Date, status?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());
    if (status) params.append('status', status);
    const response = await this.client.get(`/expenses?${params}`);
    return response.data;
  }

  async approveExpense(expenseId: string) {
    const response = await this.client.post(`/expenses/${expenseId}/approve`);
    return response.data;
  }

  async rejectExpense(expenseId: string) {
    const response = await this.client.post(`/expenses/${expenseId}/reject`);
    return response.data;
  }

  async getExpenseStats(fromDate?: Date, toDate?: Date) {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());
    const response = await this.client.get(`/expenses/stats?${params}`);
    return response.data;
  }

  // Daily closing endpoints
  async createDailyClosing(data: any) {
    const response = await this.client.post('/daily-closing', data);
    return response.data;
  }

  async submitClosing(closingId: string) {
    const response = await this.client.post(`/daily-closing/${closingId}/submit`);
    return response.data;
  }

  async approveClosing(closingId: string) {
    const response = await this.client.post(`/daily-closing/${closingId}/approve`);
    return response.data;
  }

  async rejectClosing(closingId: string) {
    const response = await this.client.post(`/daily-closing/${closingId}/reject`);
    return response.data;
  }

  async getCompanyClosings(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const response = await this.client.get(`/daily-closing?${params}`);
    return response.data;
  }

  async getClosingDetails(closingId: string) {
    const response = await this.client.get(`/daily-closing/${closingId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
