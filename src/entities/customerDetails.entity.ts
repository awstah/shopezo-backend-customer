import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Cart } from "./cart.entity";
import { Order } from "./order.entity";
import { CustomerAddress } from "./customerAddress.entity";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @OneToOne(() => User, user => user.customer)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => CustomerAddress, (address) => address.customer, { cascade: true })
    addresses: CustomerAddress[];

    @OneToOne(() => Cart, cart => cart.customer)
    cart: Cart;

    @OneToMany(() => Order, (order) => order.customer)
    orders: Order[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}