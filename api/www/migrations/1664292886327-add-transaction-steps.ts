import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTransactionSteps1664292886327 implements MigrationInterface {
  name = 'addTransactionSteps1664292886327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`transaction_steps\`
       (
           \`txId\`              varchar(70)  NOT NULL,
           \`originTxHash\`      varchar(70)  NOT NULL,
           \`destinationTxHash\` varchar(70)  NOT NULL,
           \`fromChainId\`       varchar(50)  NOT NULL,
           \`toChainId\`         varchar(50)  NOT NULL,
           \`srcToken\`          varchar(80)  NOT NULL,
           \`dstToken\`          varchar(80)  NOT NULL,
           \`amountIn\`          varchar(255) NOT NULL,
           \`amountOut\`         varchar(255) NOT NULL,
           \`aggregatorId\`      varchar(255) NOT NULL,
           \`trackingId\`        varchar(255) NOT NULL,
           \`status\`            varchar(255) NOT NULL,
           \`executed\`          timestamp NULL,
           \`completed\`         timestamp NULL,
           UNIQUE INDEX \`IDX_3102e8ece390621d18a01c7939\` (\`txId\`, \`originTxHash\`),
           PRIMARY KEY (\`txId\`, \`originTxHash\`)
       ) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`txHash\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`amountIn\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`amountOut\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`destinationTxHash\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`aggregatorId\``);
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`trackingId\``);
    await queryRunner.query(
      `ALTER TABLE \`transactions\`
          ADD \`txId\` varchar(255) NOT NULL PRIMARY KEY`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`txId\``);
    await queryRunner.query(
      `ALTER TABLE \`transactions\`
          ADD \`trackingId\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`transactions\`
        ADD \`aggregatorId\` int NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`transactions\`
          ADD \`destinationTxHash\` varchar(70) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(`ALTER TABLE \`transactions\`
        ADD \`amountOut\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`transactions\`
        ADD \`amountIn\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`transactions\`
        ADD \`txHash\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`transactions\`
        ADD PRIMARY KEY (\`txHash\`)`);
    await queryRunner.query(
      `DROP INDEX \`IDX_3102e8ece390621d18a01c7939\` ON \`transaction_steps\``,
    );
    await queryRunner.query(`DROP TABLE \`transaction_steps\``);
  }
}
