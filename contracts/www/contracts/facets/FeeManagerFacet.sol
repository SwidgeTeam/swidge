// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibStorage.sol";

contract FeeManagerFacet {

    struct Fee {
        address token;
        uint256 amount;
    }

    function listAccruedFees() external view returns (Fee[] memory) {
        LibStorage.FeeStorage storage feeStorage = LibStorage.fees();
        Fee[] memory fees = new Fee[](feeStorage.accruedTokensList.length);
        for (uint i; i < feeStorage.accruedTokensList.length; i++) {
            address token = feeStorage.accruedTokensList[i];
            fees[i].token = token;
            fees[i].amount = feeStorage.fees[token];
        }
        return fees;
    }

}
