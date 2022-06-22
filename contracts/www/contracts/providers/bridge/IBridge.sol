//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Provider.sol";

abstract contract IBridge is Provider {
    function send(
        address _token,
        address _router,
        uint256 _amount,
        uint256 _toChainId,
        bytes calldata _data
    ) external virtual;
}
