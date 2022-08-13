import { ContractAddress } from '../../../shared/types';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString, ValidateIf,
} from 'class-validator';
import { IsTxHash } from '../../../shared/infrastructure/validators/txHashValidator';
import { IsPositiveFloatString } from '../../../shared/infrastructure/validators/floatAmountValidator';

export class CreateTransactionCommand {
  @IsTxHash()
  txHash: string;

  @IsEthereumAddress()
  walletAddress: string;

  @IsEthereumAddress()
  receiver: string;

  @IsEthereumAddress()
  routerAddress: ContractAddress;

  @IsString()
  @IsNotEmpty()
  fromChainId: string;

  @IsString()
  @IsNotEmpty()
  toChainId: string;

  @IsEthereumAddress()
  srcToken: ContractAddress;

  @ValidateIf((o) => o.bridgeTokenIn !== '')
  @IsEthereumAddress()
  bridgeTokenIn: ContractAddress;

  @ValidateIf((o) => o.bridgeTokenOut !== '')
  @IsEthereumAddress()
  bridgeTokenOut: ContractAddress;

  @IsEthereumAddress()
  dstToken: ContractAddress;

  @IsPositiveFloatString()
  amount: string;
}
