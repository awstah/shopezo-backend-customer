import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Cart } from "./cart.entity";
import { Products } from "./products.entity";
import { ShopProduct } from "./shopProducts.entity";

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Cart, cart => cart.cart_items)
    @JoinColumn({ name: 'cart_id' })
    cart: Cart;

    @ManyToOne(() => ShopProduct, shopProduct => shopProduct.cart_items, { eager: true })
    @JoinColumn({ name: 'shop_product_id' })
    shop_product: ShopProduct;

    @Column('int')
    quantity: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
