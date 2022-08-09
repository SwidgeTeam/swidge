import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class TransactionEntity {
  @PrimaryColumn()
  txHash: string;

  @Column({ length: 70 })
  destinationTxHash: string;

  @Column({ length: 80 })
  walletAddress: string;

  @Column({ length: 80 })
  routerAddress: string;

  @Column({ length: 50 })
  fromChainId: string;

  @Column({ length: 50 })
  toChainId: string;

  @Column({ length: 80 })
  srcToken: string;

  @Column({ length: 80 })
  bridgeTokenIn: string;

  @Column({ length: 80 })
  bridgeTokenOut: string;

  @Column({ length: 80 })
  dstToken: string;

  @Column()
  amountIn: string;

  @Column()
  amountOut: string;

  @Column()
  bridgeAmountIn: string;

  @Column()
  bridgeAmountOut: string;

  @Column({ type: 'timestamp', nullable: true })
  executed: Date;

  @Column({ type: 'timestamp', nullable: true })
  bridged: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed: Date;
}
