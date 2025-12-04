import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Order } from "./order.entity";
import { Products } from "./products.entity";
import { ShopProduct } from "./shopProducts.entity";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ShopProduct, (shopProduct) => shopProduct.order_items)
  @JoinColumn({ name: 'shop_product_id' })
  shop_product: ShopProduct;

  @Column('int')
  quantity: number;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  discounted_amount: number;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  payable_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
