import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { MerchantModule } from './merchant/merchant.module';
import { ProductsModule } from './products/products.module';
import { OrderModule } from './order/order.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { ShopProductsModule } from './shop-products/shop-products.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RedisModule } from './upstash_redis/redis.module';



@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            schema: process.env.DB_SCHEMA || 'public',
            ssl: true,
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
            autoLoadEntities: true,
            synchronize: false
        }),
        RedisModule,
        AuthModule,
        CustomerModule,
        MerchantModule,
        ProductsModule,
        OrderModule,
        CategoriesModule,
        AdminModule,
        ShopProductsModule,
        AnalyticsModule
    ],
    controllers: [AppController],
    providers: [AppService],

})

export class AppModule { }
