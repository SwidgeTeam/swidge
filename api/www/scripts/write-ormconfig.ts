import fs = require('fs');
import databaseConfiguration from '../src/config/database.configuration';

const config = databaseConfiguration();

const finalConfig = {
  type: config.type,
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  ssl: config.ssl,
  entities: config.entities.map(removeDist),
  migrationsTableName: config.migrationsTableName,
  migrations: config.migrations.map(removeDist),
  cli: {
    migrationsDir: removeDist(config.cli.migrationsDir),
  },
  synchronize: config.synchronize,
  dropSchema: config.dropSchema,
};

fs.writeFileSync(
  'ormconfig.json',
  JSON.stringify(finalConfig, null, 2), // last parameter can be changed based on how you want the file indented
);

function removeDist(path: string): string {
  return path.replace('dist/', '');
}
