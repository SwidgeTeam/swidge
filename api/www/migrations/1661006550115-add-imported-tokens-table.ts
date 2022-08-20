import { MigrationInterface, QueryRunner } from 'typeorm';

export class addImportedTokensTable1661006550115 implements MigrationInterface {
  name = 'addImportedTokensTable1661006550115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`imported-tokens\`
                             (
                                 \`uuid\`    varchar(255) NOT NULL,
                                 \`chainId\` varchar(20) NOT NULL,
                                 \`address\` varchar(70) NOT NULL,
                                 \`wallet\`  varchar(70) NOT NULL,
                                 \`added\`   timestamp NULL,
                                 PRIMARY KEY (\`uuid\`)
                             ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`imported-tokens\``);
  }
}
