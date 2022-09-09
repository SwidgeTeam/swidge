import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTransactions1662706600688 implements MigrationInterface {
  name = 'changeTransactions1662706600688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`routerAddress\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`bridgeTokenIn\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`bridgeTokenOut\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`bridgeAmountIn\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`bridgeAmountOut\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`bridged\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`aggregatorId\` int NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`trackingId\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`trackingId\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`aggregatorId\``);
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`bridged\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`bridgeAmountOut\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`bridgeAmountIn\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`bridgeTokenOut\` varchar(80) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`bridgeTokenIn\` varchar(80) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`routerAddress\` varchar(80) NOT NULL`,
    );
  }
}
