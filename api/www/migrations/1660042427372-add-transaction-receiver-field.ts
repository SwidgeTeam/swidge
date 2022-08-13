import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTransactionFields1660042427372 implements MigrationInterface {
  name = 'addTransactionFields1660042427372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\`
        ADD \`receiver\` varchar(80) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`receiver\``);
  }
}
