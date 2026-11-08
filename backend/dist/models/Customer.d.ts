import { Model, Optional } from 'sequelize';
interface CustomerAttributes {
    id: string;
    companyId: string;
    code: string;
    name: string;
    shopName?: string;
    businessType?: string;
    mobileNumber?: string;
    address?: string;
    language?: 'en' | 'ta';
    status: 'active' | 'inactive' | 'blocked';
    verificationStatus?: 'unverified' | 'verified';
    createdAt?: Date;
    updatedAt?: Date;
}
interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> {
    id: string;
    companyId: string;
    code: string;
    name: string;
    shopName?: string;
    businessType?: string;
    mobileNumber?: string;
    address?: string;
    language?: 'en' | 'ta';
    status: 'active' | 'inactive' | 'blocked';
    verificationStatus?: 'unverified' | 'verified';
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Customer;
//# sourceMappingURL=Customer.d.ts.map