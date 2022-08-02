import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTokensTable1659433295941 implements MigrationInterface {
  name = 'addTokensTable1659433295941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tokens\` (\`chainId\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`decimals\` int NOT NULL, \`logo\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_b9519e9350a83edcc7515fe67b\` (\`chainId\`, \`address\`), PRIMARY KEY (\`chainId\`, \`address\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_b9519e9350a83edcc7515fe67b\` ON \`tokens\``);
    await queryRunner.query(`DROP TABLE \`tokens\``);
  }
}
