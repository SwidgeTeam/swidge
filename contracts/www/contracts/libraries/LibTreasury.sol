// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LibProvider.sol";

library LibTreasury {
    function getBalance(address _token) internal view returns (uint256 amount){
        if (_token == LibProvider.nativeToken()) {
            amount = address(this).balance;
        }
        else {
            amount = IERC20(_token).balanceOf(address(this));
        }
    }
}