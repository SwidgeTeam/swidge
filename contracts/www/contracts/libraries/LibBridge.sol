// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./LibApp.sol";

library LibBridge {
    enum BridgeCode {
        Anyswap // 0
    }

    function send(
        uint8 _code,
        address _token,
        uint256 _amount,
        uint256 _toChainId,
        bytes memory _data
    ) internal {
        LibApp.Provider memory bridge = LibApp.getBridge(_code);
        if (!bridge.enabled) {
            revert("Bridge not enabled");
        }

        (bool success,) = bridge.contractAddress.delegatecall(
            abi.encodeWithSelector(0x0000, _token, _amount, _toChainId, _data)
        );

        require(success, "Bridge failed");
    }
}
