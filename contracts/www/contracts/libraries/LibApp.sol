// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibApp {
    bytes32 constant APP_STORAGE_POSITION = keccak256("xyz.swidge.app.storage");
    address constant NATIVE_TOKEN_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    enum DexCode {
        ZeroEx // 0
    }

    enum BridgeCode {
        Anyswap // 0
    }

    struct AppStorage {
        address relayerAddress;
        mapping(uint8 => Provider) bridgeProviders;
        mapping(uint8 => Provider) swapProviders;
    }

    struct Provider {
        uint8 code;
        bool enabled;
        address implementation;
        address handler;
    }

    function appStorage() internal pure returns (AppStorage storage s) {
        bytes32 position = APP_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    function relayerAddress() internal view returns (address) {
        return appStorage().relayerAddress;
    }

    function getBridge(uint8 _code) internal view returns (Provider memory) {
        return appStorage().bridgeProviders[_code];
    }

    function getSwapper(uint8 _code) internal view returns (Provider memory) {
        return appStorage().swapProviders[_code];
    }

    //bytes4 constant BRIDGE_SEND_SELECTOR = bytes4(keccak256(bytes('send(address,uint256,uint256,bytes)')));

    function send(
        uint8 _code,
        address _token,
        uint256 _amount,
        uint256 _toChainId,
        bytes memory _data
    ) internal {
        Provider memory bridge = getBridge(_code);
        if (!bridge.enabled) {
            revert("Bridge not enabled");
        }

        (bool success,) = bridge.implementation.delegatecall(
            abi.encodeWithSelector(0x49bb2f22, _token, _amount, _toChainId, _data)
        );

        require(success, "Bridge failed");
    }

    //bytes4 constant SWAPPER_SWAP_SELECTOR = bytes4(keccak256(bytes('swap(address,address,uint256,bytes)')));

    function swap(
        uint8 _code,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        bytes memory _data
    ) internal returns (uint256) {
        Provider memory swapper = getSwapper(_code);
        if (!swapper.enabled) {
            revert("Swapper not enabled");
        }

        // bytes4(keccak256(bytes('swap(address,address,uint256,bytes)')))

        (bool success, bytes memory data) = swapper.implementation.delegatecall(
            abi.encodeWithSelector(0x43a0a7f2, _tokenIn, _tokenOut, _amountIn, _data)
        );
        require(success, "Swap failed");

        (uint256 boughtAmount) = abi.decode(data, (uint256));

        return boughtAmount;
    }
}
