export interface AuthResponse {
  token: string;
  userId: string;
  companyId: string;
  role: 'accountant' | 'collector';
  assignedCustomers?: string[];
  name?: string;
  email?: string;
  username?: string;
}

export interface CurrentUser {
  userId: string;
  companyId: string;
  role: 'accountant' | 'collector';
  assignedCustomers?: string[];
}

export interface ErrorResponse {
  error: string;
}
