import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Products } from "./products.entity";
import { ProductStatus } from "../common/enums/product.enum";
import { User } from "./user.entity";

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    category_name: string;

    @Column({ nullable: true })
    category_image: string;

    @Column({ unique: true, nullable: true })
    slug: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.PENDING,
    })
    status: ProductStatus;

    @ManyToOne(() => User, (user) => user.category)
    @JoinColumn({ name: "added_by" })
    added_by: User;

    @ManyToOne(() => Category, category => category.children, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parent_id' })
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];

    @OneToMany(() => Products, product => product.category)
    products: Products[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}