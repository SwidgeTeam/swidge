import { MigrationInterface, QueryRunner } from 'typeorm';

export class sushiPairsUpdated1658993357812 implements MigrationInterface {
  name = 'sushiPairsUpdated1658993357812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sushi_pairs\` ADD \`updated\` timestamp NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sushi_pairs\` DROP COLUMN \`updated\``);
  }
}
