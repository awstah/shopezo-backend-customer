import { DataSource } from "typeorm";
import "dotenv/config";

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA || 'public',
    // ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    migrations: ['src/migrations/*.ts'],
    synchronize: process.env.NODE_ENV === 'Production' ? false : true, // set to true for dev, false for prod
});

export default AppDataSource