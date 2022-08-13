import { Transaction } from '../../../../src/transactions/domain/Transaction';
import { ContractAddress } from '../../../../src/shared/types';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { faker } from '@faker-js/faker';

export class TransactionMother {
  public static create(
    _txHash: string,
    _walletAddress: string,
    _receiver: string,
    _routerAddress: ContractAddress,
    _fromChainId: string,
    _toChainId: string,
    _srcToken: ContractAddress,
    _bridgeTokenIn: ContractAddress,
    _bridgeTokenOut: ContractAddress,
    _dstToken: ContractAddress,
    _amountIn: BigInteger,
    _bridgeAmountOut: BigInteger,
    _bridgeAmountIn: BigInteger,
    _amountOut: BigInteger,
    _executed: Date,
    _bridged: Date,
    _completed: Date,
  ) {
    return new Transaction(
      _txHash,
      '',
      _walletAddress,
      _receiver,
      _routerAddress,
      _fromChainId,
      _toChainId,
      _srcToken,
      _bridgeTokenIn,
      _bridgeTokenOut,
      _dstToken,
      _amountIn,
      _bridgeAmountIn,
      _bridgeAmountOut,
      _amountOut,
      _executed,
      _bridged,
      _completed,
    );
  }

  public static randomOnGoing() {
    return this.create(
      '',
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      '137',
      '250',
      '0xLINK',
      '0xSUSHI',
      '0x',
      '0x',
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      new Date(),
      null,
      null,
    );
  }

  public static randomCompleted() {
    return this.create(
      '',
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      '137',
      '250',
      '0xLINK',
      '0xSUSHI',
      '0x',
      '0x',
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      new Date(),
      new Date(),
      new Date(),
    );
  }
}
