import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Merchant } from './merchantDetails.entity';
import { Products } from './products.entity';
import { ProductImage } from './productImages.entity';

@Entity()
export class TempProducts {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    barcode: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    unit: string;

    @Column({ nullable: true })
    packaging: string;

    @Column({ nullable: true })
    inventory_type: string;

    @Column({ nullable: true })
    file_name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ default: false })
    is_archive: boolean;
    @Column({ default: false })
    is_published: boolean;

    @ManyToOne(() => Merchant, (merchant) => merchant.tempProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'merchant_id' })
    merchant: Merchant;

    @ManyToOne(() => Products, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'product_id' })
    product: Products;

    @OneToMany(() => ProductImage, (image) => image.temp_product, {
        cascade: true,
        eager: true,
    })
    images: ProductImage[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
