import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Shopkepper } from "./shopkeeperDetails.entity";
import { Driver } from "./driverDetails.entity";
import { Stores } from "./stores.entity";
import { TempProducts } from "./tempProducts.entity";

@Entity()
export class Merchant {
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
    businessname: string;

    @Column()
    user_id: string;

    @OneToOne(() => User, user => user.merchant)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Stores, (stores) => stores.merchant)
    stores: Stores[];

    @OneToMany(() => Shopkepper, (shop_keeper) => shop_keeper.merchant)
    shop_keepers: Shopkepper[];

    @OneToMany(() => Driver, (driver) => driver.merchant)
    drivers: Shopkepper[];

    @OneToMany(() => TempProducts, (tempProduct) => tempProduct.merchant)
    tempProducts: TempProducts[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}