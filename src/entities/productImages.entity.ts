import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Products } from "./products.entity";
import { TempProducts } from "./tempProducts.entity";

@Entity('product_images')
export class ProductImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column({ default: false })
    is_deleted: boolean;

    @ManyToOne(() => Products, (product) => product.images, {
        onDelete: 'CASCADE', nullable: true
    })
    @JoinColumn({ name: 'product_id' })
    product: Products;

    @Column({nullable: true})
    product_id: string;

    @ManyToOne(() => TempProducts, (tempProducts) => tempProducts.images, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'temp_product_id' })
    temp_product: TempProducts;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
