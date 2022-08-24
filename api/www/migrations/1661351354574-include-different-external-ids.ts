import { MigrationInterface, QueryRunner } from 'typeorm';

export class includeDifferentExternalIds1661351354574 implements MigrationInterface {
  name = 'includeDifferentExternalIds1661351354574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`coingeckoId\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`tokens\` ADD \`coinmarketcapId\` varchar(255) NOT NULL`);
    await queryRunner.query(`UPDATE \`tokens\` SET \`coingeckoId\` = \`externalId\``);
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`externalId\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`coinmarketcapId\``);
    await queryRunner.query(`ALTER TABLE \`tokens\` DROP COLUMN \`coingeckoId\``);
    await queryRunner.query(
      `ALTER TABLE \`tokens\` ADD \`externalId\` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NOT NULL`,
    );
  }
}
