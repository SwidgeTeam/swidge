import { IndexAnyswapTransactions } from '../../../../src/transactions/application/command/index-anyswap-transactions';
import { createMock } from 'ts-auto-mock';
import { TransactionsRepository } from '../../../../src/transactions/domain/TransactionsRepository';
import { Transaction } from '../../../../src/transactions/domain/Transaction';
import { Queue } from 'bull';
import { FetchAnyswapTransaction } from '../../../../src/transactions/application/multichain-transaction-fetcher';
import { AnyswapTransaction } from '../../../../src/transactions/domain/AnyswapTransaction';
import { FetchAcceptedChains } from '../../../../src/transactions/application/query/fetch-accepted-chains';
import { method, On } from 'ts-auto-mock/extension';
import { TransactionMother } from '../../domain/Transaction.mother';
import { AnyswapTransactionMother } from '../../domain/AnyswapTransaction.mother';
import { CustomLogger } from '../../../../src/logger/CustomLogger';
import { Addresses } from '../../../../src/shared/domain/Addresses';
import { Contract } from '../../../../src/shared/domain/Contract';
import { randomUUID } from 'crypto';

describe('Anyswap indexer', () => {
  it('should not process transaction if origin chain is not accepted', async () => {
    // Arrange
    const mockTransactionRepository = createMock<TransactionsRepository>();
    const mockTransactionsQueue = createMock<Queue>();
    const mockLogger = createMock<CustomLogger>();
    const mockAnyswapFetcher = createMock<FetchAnyswapTransaction>({
      async execute(): Promise<AnyswapTransaction[]> {
        return [AnyswapTransactionMother.withChains('9', '2')];
      },
    });
    const mockAcceptedChainsFetcher = createMock<FetchAcceptedChains>({
      execute(): Promise<string[]> {
        return Promise.resolve(['1', '2']);
      },
    });
    const spyGetTxByHash = On(mockTransactionRepository).get(
      method('getByTxHash'),
    );
    const indexer = new IndexAnyswapTransactions(
      mockLogger,
      mockAnyswapFetcher,
      mockAcceptedChainsFetcher,
      mockTransactionRepository,
      mockTransactionsQueue,
    );

    // Act
    await indexer.execute();

    // Assert
    expect(spyGetTxByHash).toBeCalledTimes(0);
  });

  it('should not process transaction if destination chain is not accepted', async () => {
    // Arrange
    const mockLogger = createMock<CustomLogger>();
    const mockTransactionRepository = createMock<TransactionsRepository>();
    const mockTransactionsQueue = createMock<Queue>();
    const mockAnyswapFetcher = createMock<FetchAnyswapTransaction>({
      async execute(): Promise<AnyswapTransaction[]> {
        return [AnyswapTransactionMother.withChains('1', '9')];
      },
    });
    const mockAcceptedChainsFetcher = createMock<FetchAcceptedChains>({
      execute(): Promise<string[]> {
        return Promise.resolve(['1', '2']);
      },
    });
    const spyGetTxByHash = On(mockTransactionRepository).get(
      method('getByTxHash'),
    );
    const indexer = new IndexAnyswapTransactions(
      mockLogger,
      mockAnyswapFetcher,
      mockAcceptedChainsFetcher,
      mockTransactionRepository,
      mockTransactionsQueue,
    );

    // Act
    await indexer.execute();

    // Assert
    expect(spyGetTxByHash).toBeCalledTimes(0);
  });

  it('should not process transaction if fromAddress is not in the whitelisted addresses', async () => {
    // Arrange
    const mockLogger = createMock<CustomLogger>();
    const mockTransactionRepository = createMock<TransactionsRepository>({
      getAllAnyswapAddresses(): Promise<Addresses> {
        return Promise.resolve(
          new Addresses([
            new Contract('2', '0x2222222222222222222222222222222222222222'),
            new Contract('3', '0x3333333333333333333333333333333333333333'),
          ]),
        );
      },
    });
    const mockTransactionsQueue = createMock<Queue>();
    const mockAnyswapFetcher = createMock<FetchAnyswapTransaction>({
      async execute(): Promise<AnyswapTransaction[]> {
        return [AnyswapTransactionMother.default()];
      },
    });
    const mockAcceptedChainsFetcher = createMock<FetchAcceptedChains>({
      execute(): Promise<string[]> {
        return Promise.resolve(['1', '2']);
      },
    });
    const spyGetTxByHash = On(mockTransactionRepository).get(
      method('getByTxHash'),
    );
    const indexer = new IndexAnyswapTransactions(
      mockLogger,
      mockAnyswapFetcher,
      mockAcceptedChainsFetcher,
      mockTransactionRepository,
      mockTransactionsQueue,
    );

    // Act
    await indexer.execute();

    // Assert
    expect(spyGetTxByHash).toHaveBeenCalledTimes(0);
  });

  it('should process and update transaction if chains and address is valid', async () => {
    // Arrange
    const mockLogger = createMock<CustomLogger>();
    const mockTransactionRepository = createMock<TransactionsRepository>({
      getRouterAddress(): Promise<string> {
        return Promise.resolve('0x2222222222222222222222222222222222222222');
      },
    });
    const mockTransactionsQueue = createMock<Queue>();
    const mockAnyswapFetcher = createMock<FetchAnyswapTransaction>({
      async execute(): Promise<AnyswapTransaction[]> {
        return [AnyswapTransactionMother.default()];
      },
    });
    const mockAcceptedChainsFetcher = createMock<FetchAcceptedChains>({
      execute(): Promise<string[]> {
        return Promise.resolve(['1', '2']);
      },
    });

    const spyGetTxByHash = On(mockTransactionRepository).get(
      method('getByTxHash'),
    );
    const spyStore = On(mockTransactionRepository).get(method('store'));
    const spyQueueAdd = On(mockTransactionsQueue).get(method('add'));

    const indexer = new IndexAnyswapTransactions(
      mockLogger,
      mockAnyswapFetcher,
      mockAcceptedChainsFetcher,
      mockTransactionRepository,
      mockTransactionsQueue,
    );

    // Act
    await indexer.execute();

    // Assert
    expect(spyGetTxByHash).toHaveBeenCalledTimes(1);
    expect(spyStore).toHaveBeenCalledTimes(1);
    expect(spyQueueAdd).toHaveBeenCalledTimes(1);

    expect(spyGetTxByHash).toBeCalledWith(
      '0x1231231231231231231231231231231231231231231231231231231231231231',
    );
  });

  it('should queue a job with transaction details on accepted transaction', async () => {
    // Arrange
    const mockLogger = createMock<CustomLogger>();
    const uuid = randomUUID();
    const transaction = TransactionMother.standardWithUuid(uuid);
    const mockTransactionRepository = createMock<TransactionsRepository>({
      getByTxHash(txHash: string): Promise<Transaction> {
        return Promise.resolve(transaction);
      },
      getRouterAddress(): Promise<string> {
        return Promise.resolve('0x2222222222222222222222222222222222222222');
      },
    });
    const mockTransactionsQueue = createMock<Queue>();
    const mockAnyswapFetcher = createMock<FetchAnyswapTransaction>({
      async execute(): Promise<AnyswapTransaction[]> {
        return [AnyswapTransactionMother.default()];
      },
    });
    const mockAcceptedChainsFetcher = createMock<FetchAcceptedChains>({
      execute(): Promise<string[]> {
        return Promise.resolve(['1', '2']);
      },
    });

    const spyQueueAdd = On(mockTransactionsQueue).get(method('add'));

    const indexer = new IndexAnyswapTransactions(
      mockLogger,
      mockAnyswapFetcher,
      mockAcceptedChainsFetcher,
      mockTransactionRepository,
      mockTransactionsQueue,
    );

    // Act
    await indexer.execute();

    // Assert
    expect(spyQueueAdd).toHaveBeenCalledTimes(1);
    expect(spyQueueAdd).toBeCalledWith({
      router: '0x2222222222222222222222222222222222222222',
      uuid: uuid,
      toChainId: transaction.toChainId,
      dstToken: transaction.dstToken,
      bridgeAmountOut: transaction.bridgeAmountOut,
      walletAddress: transaction.walletAddress,
    });
  });

  it('should queue as many jobs as valid transactions', async () => {
    // Arrange
    const mockLogger = createMock<CustomLogger>();
    const uuid = randomUUID();
    const transaction = TransactionMother.standardWithUuid(uuid);
    const mockTransactionRepository = createMock<TransactionsRepository>({
      getByTxHash(txHash: string): Promise<Transaction> {
        return Promise.resolve(TransactionMother.standardWithUuid(uuid));
      },
      getRouterAddress(): Promise<string> {
        return Promise.resolve('0x2222222222222222222222222222222222222222');
      },
    });
    const mockTransactionsQueue = createMock<Queue>();
    const mockAnyswapFetcher = createMock<FetchAnyswapTransaction>({
      async execute(): Promise<AnyswapTransaction[]> {
        return [
          AnyswapTransactionMother.withValues('1000000', '1000000'),
          AnyswapTransactionMother.withValues('2000000', '2000000'),
        ];
      },
    });
    const mockAcceptedChainsFetcher = createMock<FetchAcceptedChains>({
      execute(): Promise<string[]> {
        return Promise.resolve(['1', '2']);
      },
    });

    const spyQueueAdd = On(mockTransactionsQueue).get(method('add'));

    const indexer = new IndexAnyswapTransactions(
      mockLogger,
      mockAnyswapFetcher,
      mockAcceptedChainsFetcher,
      mockTransactionRepository,
      mockTransactionsQueue,
    );

    // Act
    await indexer.execute();

    // Assert
    expect(spyQueueAdd).toHaveBeenCalledTimes(2);
    expect(spyQueueAdd).toHaveBeenNthCalledWith(1, {
      router: '0x2222222222222222222222222222222222222222',
      uuid: uuid,
      toChainId: transaction.toChainId,
      dstToken: transaction.dstToken,
      bridgeAmountOut: '1000000',
      walletAddress: transaction.walletAddress,
    });
    expect(spyQueueAdd).toHaveBeenNthCalledWith(2, {
      router: '0x2222222222222222222222222222222222222222',
      uuid: uuid,
      toChainId: transaction.toChainId,
      dstToken: transaction.dstToken,
      bridgeAmountOut: '2000000',
      walletAddress: transaction.walletAddress,
    });
  });

  it('should not queue transactions if already processed', async () => {
    // Arrange
    const mockLogger = createMock<CustomLogger>();
    const mockTransactionRepository = createMock<TransactionsRepository>({
      getByTxHash(txHash: string): Promise<Transaction> {
        return Promise.resolve(TransactionMother.fullyExecuted());
      },
      getAllAnyswapAddresses(): Promise<Addresses> {
        return Promise.resolve(
          new Addresses([
            new Contract('1', '0x1111111111111111111111111111111111111111'),
            new Contract('3', '0x3333333333333333333333333333333333333333'),
          ]),
        );
      },
    });
    const mockTransactionsQueue = createMock<Queue>();
    const mockAnyswapFetcher = createMock<FetchAnyswapTransaction>({
      async execute(): Promise<AnyswapTransaction[]> {
        return [
          AnyswapTransactionMother.withValues('1000000', '1000000'),
          AnyswapTransactionMother.withValues('2000000', '2000000'),
        ];
      },
    });
    const mockAcceptedChainsFetcher = createMock<FetchAcceptedChains>({
      execute(): Promise<string[]> {
        return Promise.resolve(['1', '2']);
      },
    });

    const spyQueueAdd = On(mockTransactionsQueue).get(method('add'));

    const indexer = new IndexAnyswapTransactions(
      mockLogger,
      mockAnyswapFetcher,
      mockAcceptedChainsFetcher,
      mockTransactionRepository,
      mockTransactionsQueue,
    );

    // Act
    await indexer.execute();

    // Assert
    expect(spyQueueAdd).toHaveBeenCalledTimes(0);
  });
});
