import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sushi_pairs' })
export class SushiPairsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  chainId: string;

  @Column()
  token0_id: string;

  @Column()
  token0_name: string;

  @Column()
  token0_symbol: string;

  @Column()
  token0_decimals: number;

  @Column()
  token1_id: string;

  @Column()
  token1_name: string;

  @Column()
  token1_symbol: string;

  @Column()
  token1_decimals: number;

  @Column()
  reserve0: string;

  @Column()
  reserve1: string;

  @Column({ type: 'timestamp', nullable: true })
  updated: Date;
}
