import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'chains' })
export class ChainEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  chainId: string;

  @Column()
  enabled: boolean;
}
