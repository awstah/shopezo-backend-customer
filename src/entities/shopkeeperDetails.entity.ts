import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Merchant } from "./merchantDetails.entity";
import { Stores } from "./stores.entity";
import { Driver } from "./driverDetails.entity";

@Entity()
export class Shopkepper {
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

    @Column()
    user_id: string;

    @OneToOne(() => User, user => user.shopkeeper)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Merchant, (merchant) => merchant.shop_keepers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'merchant_id' })
    merchant: Merchant;

    @ManyToOne(() => Stores, (store) => store.shop_keepers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Stores;

    @OneToMany(() => Driver, (driver) => driver.shopkeeper)
    drivers: Driver[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}