import { Fantom, Polygon } from './enums/ChainIds';

/**
 * These PriceFees are always from the native coin of the chain into USD,
 * so we can convert from one native to the other by using two of them
 */
export const PriceFeeds = {
  [Polygon]: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
  [Fantom]: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
};
