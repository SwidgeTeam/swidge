import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDatesTokensTable1659646191892 implements MigrationInterface {
  name = 'addDatesTokensTable1659646191892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`created\` timestamp NULL`);
    await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`updated\` timestamp NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`updated\``);
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`created\``);
  }
}
