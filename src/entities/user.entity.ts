import { UserRole } from "../common/enums/user-role.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Merchant } from "./merchantDetails.entity";
import { Driver } from "./driverDetails.entity";
import { Shopkepper } from "./shopkeeperDetails.entity";
import { Customer } from "./customerDetails.entity";
import { Stores } from "./stores.entity";
import { EmployeeStatus } from "../common/enums/employee.enum";
import { Banner } from "./banner.entity";
import { Favourites } from "./favourites.entity";
import { UserPaymentMethod } from "./userPaymentMethod.entity";
import { Products } from "./products.entity";
import { ShopProduct } from "./shopProducts.entity";
import { Notification } from "./notification.entity";
import { Complaint } from "./complaint.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'supabase_user_id' })
    supabase_id: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ length: 255, nullable: true })
    first_name: string;

    @Column({ length: 255, nullable: true })
    last_name: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({ nullable: false, length: 255 })
    password: string;

    @Column({ type: 'enum', enum: UserRole, nullable: false, default: UserRole.CUSTOMER })
    role: UserRole;

    @Column({ nullable: true })
    profile_picture_url: string;

    @Column({ type: 'boolean', default: false })
    is_verified: boolean;

    @Column({ type: 'boolean', default: false })
    is_email_verified: boolean;

    @Column({ type: 'boolean', default: false })
    is_phone_verified: boolean;

    @Column({ nullable: true })
    phone_number?: string;

    @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
    status: string;

    @Column({ nullable: true })
    hashed_refresh_token: string;

    @OneToOne(() => Merchant, merchant => merchant.user)
    merchant: Merchant;

    @OneToOne(() => Driver, driver => driver.user)
    driver: Driver;

    @OneToOne(() => Shopkepper, shopkeeper => shopkeeper.user)
    shopkeeper: Shopkepper;

    @OneToOne(() => Customer, customer => customer.user)
    customer: Customer;

    @ManyToOne(() => User, user => user.createdUsers, { nullable: true })
    @JoinColumn({ name: 'parent_user_id' })
    parentUser: User;

    @OneToMany(() => User, user => user.parentUser)
    createdUsers: User[];

    @OneToMany(() => Stores, (stores) => stores.user)
    stores: Stores[];

    @OneToMany(() => Banner, (banner) => banner.user)
    banners: Banner[];

    @OneToMany(() => Favourites, (fav) => fav.user)
    favourites: Favourites[];

    @OneToMany(() => UserPaymentMethod, method => method.user)
    payment_methods: UserPaymentMethod[];

    @OneToMany(() => Products, (product) => product.added_by)
    products: Products[];

    @OneToMany(() => Products, (category) => category.added_by)
    category: Products[];

    @OneToMany(() => ShopProduct, (shop_product) => shop_product.added_by)
    shop_products: ShopProduct[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToMany(() => Complaint, (complaint) => complaint.user)
    complaints: Complaint[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}