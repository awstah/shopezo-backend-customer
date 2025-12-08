import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComplaintStatus } from "../common/enums/complaint.enum";
import { Customer } from "./customerDetails.entity";
import { Merchant } from "./merchantDetails.entity";
import { Order } from "./order.entity";
import { User } from "./user.entity";

@Entity()
export class Complaint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, (customer) => customer.complaints, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => User, (user) => user.complaints, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Order, (order) => order.complaints, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'order_id' })
    order?: Order;

    @ManyToOne(() => Merchant, (merchant) => merchant.complaints, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'merchant_id' })
    merchant?: Merchant;

    @Column({ length: 150 })
    subject: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: ComplaintStatus, default: ComplaintStatus.OPEN })
    status: ComplaintStatus;

    @Column({ type: 'text', nullable: true })
    admin_note?: string;

    @Column({ nullable: true })
    image_url?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

