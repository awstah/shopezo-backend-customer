import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customerDetails.entity';
import { Order } from './order.entity';

@Entity()
export class CustomerAddress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    address_line: string; // full address line (street, building, etc.)

    @Column({ type: 'varchar', length: 255, nullable: false })
    city: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    state: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    country: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    postal_code: string;

    @Column('double precision', { nullable: true })
    latitude: number;
    
    @Column('double precision', { nullable: true })
    longitude: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    label: string; // e.g., "Home", "Office"

    @Column({ type: 'boolean', default: false })
    is_primary: boolean; // mark as default address

    @Column({ type: 'boolean', default: false })
    is_active: boolean;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @ManyToOne(() => Customer, (customer) => customer.addresses, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => Order, (order) => order.customer_address)
    orders: Order[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
