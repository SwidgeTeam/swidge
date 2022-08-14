import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1653732446347 implements MigrationInterface {
  name = 'initial1653732446347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`contract_addresses\`
                             (
                                 \`id\`           varchar(36)  NOT NULL,
                                 \`typeContract\` varchar(255) NOT NULL,
                                 \`chainId\`      varchar(255) NOT NULL,
                                 \`address\`      varchar(255) NOT NULL,
                                 \`enabled\`      tinyint      NOT NULL,
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`transactions\`
                             (
                                 \`txHash\`          varchar(255) NOT NULL,
                                 \`walletAddress\`   varchar(80)  NOT NULL,
                                 \`routerAddress\`   varchar(80)  NOT NULL,
                                 \`fromChainId\`     varchar(50)  NOT NULL,
                                 \`toChainId\`       varchar(50)  NOT NULL,
                                 \`srcToken\`        varchar(80)  NOT NULL,
                                 \`bridgeTokenIn\`   varchar(80)  NOT NULL,
                                 \`bridgeTokenOut\`  varchar(80)  NOT NULL,
                                 \`dstToken\`        varchar(80)  NOT NULL,
                                 \`amountIn\`        varchar(255) NOT NULL,
                                 \`amountOut\`       varchar(255) NOT NULL,
                                 \`bridgeAmountIn\`  varchar(255) NOT NULL,
                                 \`bridgeAmountOut\` varchar(255) NOT NULL,
                                 \`executed\`        timestamp NULL,
                                 \`bridged\`         timestamp NULL,
                                 \`completed\`       timestamp NULL,
                                 PRIMARY KEY (\`txHash\`)
                             ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`transactions\``);
    await queryRunner.query(`DROP TABLE \`contract_addresses\``);
  }

}
