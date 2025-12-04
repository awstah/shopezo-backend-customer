import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeInsert } from "typeorm";
import { User } from "./user.entity";
import { Customer } from "./customerDetails.entity";
import { OrderItem } from "./orderItem.entity";
import { OrderStatus } from "../common/enums/order.enum";
import { PaymentMethod } from "../common/enums/payment.enum";
import { CustomerAddress } from "./customerAddress.entity";
import { Driver } from "./driverDetails.entity";
import { OrderDriverAssignment } from "./orderDriverAssignment.entity";
import { randomBytes } from "crypto";

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, (customer) => customer.orders)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @Column('numeric', { precision: 10, scale: 2, default: 0 })
    total_amount: number;

    @Column('numeric', { precision: 10, scale: 2, default: 0 })
    total_discounted_amount: number;

    @Column('numeric', { precision: 10, scale: 2, default: 0 })
    total_payable_amount: number;

    @Column({ nullable: true })
    address: string;

    @Column({ type: "varchar", length: 20, unique: true, nullable: true })
    order_number: string;

    @Column({ nullable: true })
    delivery_image: string;

    @Column({ nullable: true })
    geo_location: string;

    @ManyToOne(() => CustomerAddress, (customerAddress) => customerAddress.orders)
    @JoinColumn({ name: 'customer_address_id' })
    customer_address: CustomerAddress;

    @ManyToOne(() => Driver, (driver) => driver.orders, { nullable: true })
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @OneToMany(() => OrderDriverAssignment, (oda) => oda.order)
    driver_assignments: OrderDriverAssignment[];

    @Column({ type: 'enum', enum: PaymentMethod, nullable: true, default: PaymentMethod.COD })
    payment_type: PaymentMethod;

    @Column({ type: 'enum', enum: OrderStatus, nullable: false, default: OrderStatus.PENDING })
    order_status: OrderStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @BeforeInsert()
    generateOrderNumber() {
        // Random 6 bytes → 12 hex chars (example: "a5c4f2b31d0e")
        this.order_number = randomBytes(5).toString('hex');
    }
}
