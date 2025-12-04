import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Stores } from './stores.entity';
import { Products } from './products.entity';
import { CartItem } from './cartItem.entity';
import { Favourites } from './favourites.entity';
import { OrderItem } from './orderItem.entity';
import { User } from './user.entity';

@Entity()
export class ShopProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    sku: string;

    @ManyToOne(() => Stores, (store) => store.shop_products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Stores;

    @ManyToOne(() => Products, (product) => product.shop_products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Products;

    @ManyToOne(() => User, (user) => user.shop_products, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'added_by' })
    added_by: User;

    @Column('numeric', { precision: 10, scale: 2, default: 0 })
    price: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'int', default: 0 })
    discount: number;

    @Column({ default: true })
    is_available: boolean;

    @Column({ type: 'int', default: 0 })
    reviews: number;

    @Column({ default: false })
    is_deleted: boolean;

    @OneToMany(() => CartItem, cartItem => cartItem.shop_product)
    cart_items: CartItem[];

    @OneToMany(() => OrderItem, orderItem => orderItem.shop_product)
    order_items: OrderItem[]

    @OneToMany(() => Favourites, fav => fav.shop_product)
    favourites: Favourites;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
