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
  receiver: string;

  @Column({ length: 50 })
  fromChainId: string;

  @Column({ length: 50 })
  toChainId: string;

  @Column({ length: 80 })
  srcToken: string;

  @Column({ length: 80 })
  dstToken: string;

  @Column()
  amountIn: string;

  @Column()
  amountOut: string;

  @Column()
  aggregatorId: number;

  @Column()
  trackingId: string;

  @Column()
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  executed: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed: Date;
}
