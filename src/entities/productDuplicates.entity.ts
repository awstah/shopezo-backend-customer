import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Products } from './products.entity';
import { TempProducts } from './tempProducts.entity';

@Entity()
export class ProductDuplicates {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    file_name: string;

    @ManyToOne(() => TempProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'temp_product_id' })
    temp_product: TempProducts;

    @ManyToOne(() => Products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Products;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
