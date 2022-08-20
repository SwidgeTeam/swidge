import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'imported-tokens' })
export class ImportedTokensEntity {
  @PrimaryColumn()
  uuid: string;

  @Column({ length: 20 })
  chainId: string;

  @Column({ length: 70 })
  address: string;

  @Column({ length: 70 })
  wallet: string;

  @Column({ type: 'timestamp', nullable: true })
  added: Date;
}
