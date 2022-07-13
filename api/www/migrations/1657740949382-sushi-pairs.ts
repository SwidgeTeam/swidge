import { MigrationInterface, QueryRunner } from 'typeorm';

export class sushiPairs1657740949382 implements MigrationInterface {
  name = 'sushiPairs1657740949382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`sushi_pairs\` (\`id\` varchar(36) NOT NULL, \`chainId\` varchar(255) NOT NULL, \`token0_id\` varchar(255) NOT NULL, \`token0_name\` varchar(255) NOT NULL, \`token0_symbol\` varchar(255) NOT NULL, \`token0_decimals\` int NOT NULL, \`token1_id\` varchar(255) NOT NULL, \`token1_name\` varchar(255) NOT NULL, \`token1_symbol\` varchar(255) NOT NULL, \`token1_decimals\` int NOT NULL, \`reserve0\` varchar(255) NOT NULL, \`reserve1\` varchar(255) NOT NULL, INDEX \`IDX_cd2922f662e152eeb067c2b313\` (\`chainId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_cd2922f662e152eeb067c2b313\` ON \`sushi_pairs\``);
    await queryRunner.query(`DROP TABLE \`sushi_pairs\``);
  }
}
