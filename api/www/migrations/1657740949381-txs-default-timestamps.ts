import { MigrationInterface, QueryRunner } from 'typeorm';

export class txsDefaultTimestamps1657740949381 implements MigrationInterface {
  name = 'txsDefaultTimestamps1657740949381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`executed\` \`executed\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`bridged\` \`bridged\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`completed\` \`completed\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`executed\` \`executed\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`bridged\` \`bridged\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`completed\` \`completed\` timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`completed\` \`completed\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`bridged\` \`bridged\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`executed\` \`executed\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`completed\` \`completed\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`bridged\` \`bridged\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`executed\` \`executed\` timestamp NULL DEFAULT 'NULL'`,
    );
  }
}
