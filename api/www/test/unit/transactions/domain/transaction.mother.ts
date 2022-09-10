import { Transaction } from '../../../../src/transactions/domain/Transaction';
import { ContractAddress } from '../../../../src/shared/types';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { faker } from '@faker-js/faker';
import { ExternalTransactionStatus } from '../../../../src/aggregators/domain/status-check';

export class TransactionMother {
  public static create(
    _txHash: string,
    _walletAddress: string,
    _receiver: string,
    _fromChainId: string,
    _toChainId: string,
    _srcToken: ContractAddress,
    _dstToken: ContractAddress,
    _amountIn: BigInteger,
    _amountOut: BigInteger,
    _executed: Date,
    _completed: Date,
    _status: ExternalTransactionStatus,
  ) {
    return new Transaction(
      _txHash,
      '',
      _walletAddress,
      _receiver,
      _fromChainId,
      _toChainId,
      _srcToken,
      _dstToken,
      _amountIn,
      _amountOut,
      _executed,
      _completed,
      _status,
    );
  }

  public static randomOnGoing() {
    return this.create(
      '',
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      '137',
      '250',
      '0xLINK',
      '0xSUSHI',
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      new Date(),
      null,
      'pending' as ExternalTransactionStatus,
    );
  }

  public static randomCompleted() {
    return this.create(
      '',
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      '137',
      '250',
      '0xLINK',
      '0xSUSHI',
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('10'),
      new Date(),
      new Date(),
      ExternalTransactionStatus.Success,
    );
  }
}
