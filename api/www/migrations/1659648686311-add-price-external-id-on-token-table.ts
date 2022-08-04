import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPriceExternalIdOnTokenTable1659648686311 implements MigrationInterface {
  name = 'addPriceExternalIdOnTokenTable1659648686311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`externalId\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`price\` int NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`price\``);
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`externalId\``);
  }
}
