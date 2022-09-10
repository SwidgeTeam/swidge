import { TransactionMother } from './transaction.mother';

describe('Transaction', () => {
  it('Should return ongoing status when not completed', () => {
    // Arrange
    const tx = TransactionMother.randomOnGoing();

    // Act
    const status = tx.status;

    // Assert
    expect(status).toEqual(0);
  });

  it('Should return completed status when completed', () => {
    // Arrange
    const tx = TransactionMother.randomCompleted();

    // Act
    const status = tx.status;

    // Assert
    expect(status).toEqual(2);
  });
});
