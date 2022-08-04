import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tokens' })
@Index(['chainId', 'address'], { unique: true })
export class TokensEntity {
  @PrimaryColumn()
  chainId: string;

  @PrimaryColumn()
  address: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  decimals: number;

  @Column()
  logo: string;

  @Column()
  externalId: string;

  @Column({ type: 'timestamp', nullable: true })
  created: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated: Date;
}
