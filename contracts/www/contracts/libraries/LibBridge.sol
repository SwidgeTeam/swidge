// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

library LibBridge {
    address constant ANYSWAP_V4_ROUTER = address(0x4f3Aff3A747fCADe12598081e80c6605A8be192F);

    enum BridgeCode {
        Anyswap // 0
    }

    function send(
        BridgeCode _code,
        address _token,
        uint256 _amount,
        uint256 _toChainId,
        bytes memory _data
    ) internal {
        if (_code == BridgeCode.Anyswap) {
            send_anyswap(
                _token,
                _amount,
                _toChainId,
                _data
            );
        }
    }

    function send_anyswap(
        address _token,
        uint256 _amount,
        uint256 _toChainId,
        bytes memory _data
    ) internal {
        // Approve tokens for the bridge to take
        TransferHelper.safeApprove(_token, ANYSWAP_V4_ROUTER, _amount);

        // Decode data to get address of custom token
        address _anyTokenAddress = abi.decode(_data, (address));

        // bytes4(keccak256(bytes('anySwapOutUnderlying(address,address,uint256,uint256)')))
        (bool success,) = ANYSWAP_V4_ROUTER.call(
            abi.encodeWithSelector(0xedbdf5e2, _anyTokenAddress, address(this), _amount, _toChainId)
        );

        require(success, "Bridge failed");
    }
}
