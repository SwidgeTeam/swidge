import { MigrationInterface, QueryRunner } from 'typeorm';

export class addExternalIdTokensTable1659648048063 implements MigrationInterface {
  name = 'addExternalIdTokensTable1659648048063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`externalId\` varchar(255) NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`externalId\``);
  }
}
