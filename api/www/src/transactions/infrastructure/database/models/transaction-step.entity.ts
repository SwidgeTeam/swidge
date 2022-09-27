import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'transaction_steps' })
@Index(['txId', 'originTxHash'], { unique: true })
export class TransactionStepEntity {
  @PrimaryColumn({ length: 70 })
  txId: string;

  @PrimaryColumn({ length: 70 })
  originTxHash: string;

  @Column({ length: 70 })
  destinationTxHash: string;

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
  aggregatorId: string;

  @Column()
  trackingId: string;

  @Column()
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  executed: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed: Date;
}
