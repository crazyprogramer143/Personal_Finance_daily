import { Model, Optional } from 'sequelize';
interface UserAttributes {
    id: string;
    companyId: string;
    username?: string | null;
    email?: string | null;
    passwordHash: string;
    role: 'accountant' | 'collector';
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> {
    id: string;
    companyId: string;
    username: string | null;
    email: string | null;
    passwordHash: string;
    role: 'accountant' | 'collector';
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default User;
//# sourceMappingURL=User.d.ts.map