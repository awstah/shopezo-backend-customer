import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserPaymentMethod {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.payment_methods)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    card_holder_name: string;

    @Column()
    card_number: string;

    @Column()
    card_brand: string; // visa, mastercard, etc.

    @Column()
    expiry_month: string;

    @Column()
    expiry_year: string;

    @Column()
    cvv: string;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ default: false })
    is_default: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}