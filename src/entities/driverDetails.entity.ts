import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { DriverAvailabilityStatus, DriverStatus } from "../common/enums/driver.enum";
import { Merchant } from "./merchantDetails.entity";
import { Stores } from "./stores.entity";
import { Shopkepper } from "./shopkeeperDetails.entity";
import { Order } from "./order.entity";
import { OrderDriverAssignment } from "./orderDriverAssignment.entity";

@Entity()
export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    address_1: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address_2: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    country: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    state: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    city: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    vehicle_type: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    license_number: string;

    @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.INACTIVE })
    current_status: string;

    @Column({ type: 'enum', enum: DriverAvailabilityStatus, default: DriverAvailabilityStatus.FREE })
    driver_status: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    current_location: string;

    @Column()
    user_id: string;

    @OneToOne(() => User, user => user.driver)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Merchant, (merchant) => merchant.drivers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'merchant_id' })
    merchant: Merchant;

    @ManyToOne(() => Stores, (store) => store.drivers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Stores;

    @ManyToOne(() => Shopkepper, (shopkeepr) => shopkeepr.drivers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shopkeeper_id' })
    shopkeeper: Shopkepper;

    @OneToMany(() => Order, (order) => order.driver)
    orders: Order[];

    @OneToMany(() => OrderDriverAssignment, (oda) => oda.driver)
    assignments: OrderDriverAssignment[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}