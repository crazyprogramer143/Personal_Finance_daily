import { Model, Optional } from 'sequelize';
interface CompanyAttributes {
    id: string;
    email: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Company extends Model<CompanyAttributes, CompanyCreationAttributes> {
    id: string;
    email: string;
    name: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Company;
//# sourceMappingURL=Company.d.ts.map