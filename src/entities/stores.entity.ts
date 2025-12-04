import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Products } from './products.entity';
import { ShopProduct } from './shopProducts.entity';
import { Favourites } from './favourites.entity';
import { Shopkepper } from './shopkeeperDetails.entity';
import { Driver } from './driverDetails.entity';
import { Merchant } from './merchantDetails.entity';
import { Banner } from './banner.entity';

@Entity()
export class Stores {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    store_name: string;

    @Column()
    store_address: string;

    @Column({ nullable: true })
    store_logo: string;

    @Column({ default: false })
    is_deleted: boolean;

    @Column('double precision', { nullable: true })
    latitude: number;
    
    @Column('double precision', { nullable: true })
    longitude: number;

    @ManyToOne(() => User, (user) => user.stores, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Merchant, (merchant) => merchant.stores, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'merchant_id' })
    merchant: Merchant;

    @OneToMany(() => ShopProduct, (shopProduct) => shopProduct.store)
    shop_products: ShopProduct[];

    @OneToMany(() => Favourites, (favorite) => favorite.store)
    favorites: Favourites[];

    @OneToMany(() => Shopkepper, (shop_keeper) => shop_keeper.store)
    shop_keepers: Shopkepper[];

    @OneToMany(() => Driver, (driver) => driver.store)
    drivers: Driver[];

    @OneToMany(() => Banner, (banner) => banner.store)
    banners: Banner[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
