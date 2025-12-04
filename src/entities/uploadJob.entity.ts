import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Merchant } from './merchantDetails.entity';
import { UploadJobStatus } from '../common/enums/product.enum';

@Entity()
export class UploadJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    file_name: string;

    @Column({ type: 'int', default: 0 })
    total_csv_records: number;

    @Column({ type: 'int', default: 0 })
    total_inserted: number;

    @Column({
        type: 'enum',
        enum: UploadJobStatus,
        default: UploadJobStatus.PENDING,
    })
    status: UploadJobStatus;

    @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'merchant_id' })
    merchant: Merchant;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    completed_at: Date | null;
}
