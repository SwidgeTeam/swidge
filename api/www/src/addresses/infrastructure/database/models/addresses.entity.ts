import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'contract_addresses' })
export class AddressesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  typeContract: string;

  @Column()
  chainId: string;

  @Column()
  address: string;

  @Column()
  enabled: boolean;
}
