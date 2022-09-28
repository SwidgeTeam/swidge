import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class TransactionEntity {
  @PrimaryColumn()
  txId: string;

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
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  executed: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed: Date;
}
