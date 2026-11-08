import { Model, Optional } from 'sequelize';
interface CustomerCollectorAssignmentAttributes {
    id: string;
    customerId: string;
    collectorId: string;
    companyId: string;
    assignedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface CustomerCollectorAssignmentCreationAttributes extends Optional<CustomerCollectorAssignmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class CustomerCollectorAssignment extends Model<CustomerCollectorAssignmentAttributes, CustomerCollectorAssignmentCreationAttributes> {
    id: string;
    customerId: string;
    collectorId: string;
    companyId: string;
    assignedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default CustomerCollectorAssignment;
//# sourceMappingURL=CustomerCollectorAssignment.d.ts.map