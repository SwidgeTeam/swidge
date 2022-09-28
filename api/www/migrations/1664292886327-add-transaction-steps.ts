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

    await queryRunner.query(
      `create table transactions_tmp
       (
           walletAddress varchar(80)  not null,
           fromChainId   varchar(50)  not null,
           toChainId     varchar(50)  not null,
           srcToken      varchar(80)  not null,
           dstToken      varchar(80)  not null,
           executed      timestamp null,
           completed     timestamp null,
           receiver      varchar(80)  not null,
           status        varchar(255) not null,
           id            varchar(255) not null primary key
       )`,
    );

    await queryRunner.query(
      `CREATE PROCEDURE migratetxs()
BEGIN
    DECLARE v_txHash VARCHAR(255);
    DECLARE v_destinationTxHash VARCHAR(255);
    DECLARE v_wallet VARCHAR(255);
    DECLARE v_receiver VARCHAR(255);
    DECLARE v_fromChainId VARCHAR(255);
    DECLARE v_toChainId VARCHAR(255);
    DECLARE v_srcToken VARCHAR(255);
    DECLARE v_dstToken VARCHAR(255);
    DECLARE v_amountIn VARCHAR(255);
    DECLARE v_amountOut VARCHAR(255);
    DECLARE v_aggregatorId VARCHAR(255);
    DECLARE v_trackingId VARCHAR(255);
    DECLARE v_status VARCHAR(255);
    DECLARE v_executed date;
    DECLARE v_completed date;
    DECLARE v_uuid VARCHAR(255);

    DECLARE finished INTEGER DEFAULT 0;

    ## declare cursor
    DECLARE tx_cursor CURSOR FOR SELECT txHash,
                                        destinationTxHash,
                                        fromChainId,
                                        walletAddress,
                                        receiver,
                                        toChainId,
                                        srcToken,
                                        dstToken,
                                        amountIn,
                                        amountOut,
                                        aggregatorId,
                                        trackingId,
                                        status,
                                        executed,
                                        completed
                                 FROM transactions;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = 1;

    OPEN tx_cursor;

    txLoop:
    LOOP
        # fetch row
        FETCH tx_cursor INTO
            v_txHash,
            v_destinationTxHash,
            v_wallet,
            v_receiver,
            v_fromChainId,
            v_toChainId,
            v_srcToken,
            v_dstToken,
            v_amountIn,
            v_amountOut,
            v_aggregatorId,
            v_trackingId,
            v_status,
            v_executed,
            v_completed;

        IF finished THEN LEAVE txLoop; END IF;

        #  create unique ID
        SET v_uuid = UUID();

        # insert step
        INSERT INTO transaction_steps (\`txId\`,
                                       \`originTxHash\`,
                                       \`destinationTxHash\`,
                                       \`fromChainId\`,
                                       \`toChainId\`,
                                       \`srcToken\`,
                                       \`dstToken\`,
                                       \`amountIn\`,
                                       \`amountOut\`,
                                       \`aggregatorId\`,
                                       \`trackingId\`,
                                       \`status\`,
                                       \`executed\`,
                                       \`completed\`)
        VALUES (v_uuid,
                v_txHash,
                v_destinationTxHash,
                v_fromChainId,
                v_toChainId,
                v_srcToken,
                v_dstToken,
                v_amountIn,
                v_amountOut,
                v_aggregatorId,
                v_trackingId,
                v_status,
                v_executed,
                v_completed);

        # insert tx
        INSERT INTO transactions_tmp (walletAddress,
                                   fromChainId,
                                   toChainId,
                                   srcToken,
                                   dstToken,
                                   executed,
                                   completed,
                                   receiver,
                                   status,
                                   id)
        VALUES (v_wallet,
                v_fromChainId,
                v_toChainId,
                v_srcToken,
                v_dstToken,
                v_executed,
                v_completed,
                v_receiver,
                v_status,
                v_uuid);

    END LOOP txLoop;
    CLOSE tx_cursor;
    
    TRUNCATE transactions;
END`,
    );

    await queryRunner.query(`call migratetxs`);

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

    await queryRunner.query(`INSERT INTO transactions SELECT * FROM transactions_tmp`);
    await queryRunner.query(`DROP TABLE transactions_tmp`);
    await queryRunner.query(`DROP PROCEDURE migratetxs`);
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
