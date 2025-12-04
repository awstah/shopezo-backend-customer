import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column, JoinColumn, UpdateDateColumn } from "typeorm";
import { Order } from "./order.entity";
import { DriverAssignmentStatus } from "../common/enums/order.enum";
import { Driver } from "./driverDetails.entity";
import { User } from "./user.entity";

@Entity()
export class OrderDriverAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.driver_assignments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order: Order;

    @ManyToOne(() => Driver, (driver) => driver.assignments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "driver_id" })
    driver: Driver;

    @Column({
        type: "enum",
        enum: DriverAssignmentStatus,
        default: DriverAssignmentStatus.ASSIGNED
    })
    status: DriverAssignmentStatus;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'assigned_by' })
    assigned_by: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
