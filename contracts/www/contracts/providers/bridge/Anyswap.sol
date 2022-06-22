//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./IBridge.sol";

interface AnyswapRouter {
    function anySwapOutUnderlying(address token, address to, uint amount, uint toChainID) external;
}

contract Anyswap is IBridge {
    AnyswapRouter private bridge;

    constructor(address bridgeAddress) {
        bridge = AnyswapRouter(bridgeAddress);
    }

    function send(
        address _token,
        address _router,
        uint256 _amount,
        uint256 _toChainId,
        bytes calldata _data
    ) external override onlyRouter {
        // Take ownership of tokens
        TransferHelper.safeTransferFrom(_token, _router, address(this), _amount);

        // Approve tokens for the bridge to take
        TransferHelper.safeApprove(_token, address(bridge), _amount);

        // Decode data to get address of custom token
        address _anyTokenAddress = abi.decode(_data, (address));

        // Execute bridge process
        bridge.anySwapOutUnderlying(_anyTokenAddress, _router, _amount, _toChainId);
    }
}
