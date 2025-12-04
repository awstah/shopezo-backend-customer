import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Stores } from "./stores.entity";
import { ProductImage } from "./productImages.entity";
import { CartItem } from "./cartItem.entity";
import { OrderItem } from "./orderItem.entity";
import { Category } from "./categories.entity";
import { ShopProduct } from "./shopProducts.entity";
import { User } from "./user.entity";
import { ProductStatus } from "../common/enums/product.enum";
import { Favourites } from "./favourites.entity";

@Entity('products')
export class Products {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    product_name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ unique: true, nullable: true })
    slug: string;

    @Column({ nullable: true })
    product_size: string;

    @Column({ nullable: true, unique: true })
    barcode: string;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.PENDING,
    })
    status: ProductStatus;

    @OneToMany(() => ProductImage, (image) => image.product, {
        cascade: true,
        eager: true,
    })
    images: ProductImage[];

    @ManyToOne(() => Category, category => category.products, {
        onDelete: 'SET NULL'
    })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => ShopProduct, (shopProduct) => shopProduct.product)
    shop_products: ShopProduct[];

    @ManyToOne(() => User, (user) => user.products)
    @JoinColumn({ name: "added_by" })
    added_by: User;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
