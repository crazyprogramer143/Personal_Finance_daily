import jwt from 'jsonwebtoken';
interface SignupPayload {
    email: string;
    name: string;
    password: string;
}
interface LoginPayload {
    email?: string;
    username?: string;
    password: string;
}
interface AuthResponse {
    token: string;
    userId: string;
    companyId: string;
    role: 'accountant' | 'collector';
    assignedCustomers?: string[];
    name?: string;
    email?: string;
    username?: string;
}
export declare class AuthService {
    /**
     * Company signup - Create new company and owner account
     */
    static signup(payload: SignupPayload): Promise<AuthResponse>;
    /**
     * Login - Owner (email) or Collector (username)
     */
    static login(payload: LoginPayload): Promise<AuthResponse>;
    /**
     * Generate JWT token
     */
    static generateToken(userId: string, companyId: string, role: 'accountant' | 'collector', assignedCustomers?: string[]): string;
    /**
     * Validate token
     */
    static validateToken(token: string): string | jwt.JwtPayload;
}
export default AuthService;
//# sourceMappingURL=auth.service.d.ts.map