import 'dotenv/config';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export default (): MysqlConnectionOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production',
  entities: ['dist/**/infrastructure/database/models/*.entity.{ts,js}'],
  migrationsTableName: 'migrations',
  migrations: ['dist/migrations/*.ts'],
  cli: {
    migrationsDir: 'dist/migrations',
  },
  synchronize: false,
  dropSchema: false,
});
