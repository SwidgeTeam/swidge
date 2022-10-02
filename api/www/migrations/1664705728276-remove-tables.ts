import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeTables1664705728276 implements MigrationInterface {
  name = 'removeTables1664705728276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`contract_addresses\``);
    await queryRunner.query(`DROP TABLE \`chains\``);
    await queryRunner.query(`DROP TABLE \`tokens\``);
    await queryRunner.query(`DROP TABLE \`sushi_pairs\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
