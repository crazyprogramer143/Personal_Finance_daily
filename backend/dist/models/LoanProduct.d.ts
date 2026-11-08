import { Model, Optional } from 'sequelize';
interface LoanProductAttributes {
    id: string;
    companyId: string;
    name: string;
    interestRatePercent?: number;
    totalRepaymentAmount?: number;
    minPrincipal?: number;
    maxPrincipal?: number;
    durationDays: number;
    collectionFrequency: 'daily' | 'weekly' | 'monthly';
    status: 'active' | 'inactive';
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LoanProductCreationAttributes extends Optional<LoanProductAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class LoanProduct extends Model<LoanProductAttributes, LoanProductCreationAttributes> {
    id: string;
    companyId: string;
    name: string;
    interestRatePercent?: number;
    totalRepaymentAmount?: number;
    minPrincipal?: number;
    maxPrincipal?: number;
    durationDays: number;
    collectionFrequency: 'daily' | 'weekly' | 'monthly';
    status: 'active' | 'inactive';
    description?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default LoanProduct;
//# sourceMappingURL=LoanProduct.d.ts.map