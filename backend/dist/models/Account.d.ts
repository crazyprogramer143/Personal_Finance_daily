import { Model, Optional } from 'sequelize';
interface AccountAttributes {
    id: string;
    companyId: string;
    name: string;
    type: 'cash' | 'bank' | 'upi';
    balance: number;
    heldAmount: number;
    currency: string;
    bankName?: string;
    accountNumber?: string;
    upiId?: string;
    status: 'active' | 'inactive';
    createdAt?: Date;
    updatedAt?: Date;
}
interface AccountCreationAttributes extends Optional<AccountAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Account extends Model<AccountAttributes, AccountCreationAttributes> {
    id: string;
    companyId: string;
    name: string;
    type: 'cash' | 'bank' | 'upi';
    balance: number;
    heldAmount: number;
    currency: string;
    bankName?: string;
    accountNumber?: string;
    upiId?: string;
    status: 'active' | 'inactive';
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Account;
//# sourceMappingURL=Account.d.ts.map