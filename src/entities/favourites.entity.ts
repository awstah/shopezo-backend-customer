import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Products } from './products.entity';
import { Stores } from './stores.entity';
import { ShopProduct } from './shopProducts.entity';

@Entity()
export class Favourites {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.banners, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => ShopProduct, (shopProduct) => shopProduct.favourites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shop_product_id' })
    shop_product: ShopProduct;

    @ManyToOne(() => Stores, (store) => store.favorites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Stores;

    @Column({ default: false })
    is_fav: boolean

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
