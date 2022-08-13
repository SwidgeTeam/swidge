import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDestinationTxHash1660042427372 implements MigrationInterface {
  name = 'addDestinationTxHash1660042427372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\`
          ADD \`destinationTxHash\` varchar(70) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`destinationTxHash\``);
  }
}
