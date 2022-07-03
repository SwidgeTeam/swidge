// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LibStorage.sol";

library LibFees {

    /**
     * Adds the fee amount to the accrued fees
     * @param _token The token that is being kept
     * @param _amount The total amount that is being kept
     */
    function addFee(address _token, uint256 _amount) internal {
        LibStorage.FeeStorage storage feeStorage = LibStorage.fees();
        if (feeStorage.accruedTokens[_token]) {
            uint256 currentAmount = feeStorage.fees[_token];
            feeStorage.fees[_token] = currentAmount + _amount;
        }
        else {
            feeStorage.fees[_token] = _amount;
            feeStorage.accruedTokens[_token] = true;
            feeStorage.accruedTokensList.push(_token);
        }
    }
}