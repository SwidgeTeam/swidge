// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibApp {
    bytes32 constant APP_STORAGE_POSITION = keccak256("xyz.swidge.app.storage");
    address constant NATIVE_TOKEN_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    bytes4 constant BRIDGE_SEND_SELECTOR = bytes4(keccak256(bytes('send(address,uint256,uint256,bytes)')));

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

        (bool success,) = bridge.implementation.delegatecall(
            abi.encodeWithSelector(BRIDGE_SEND_SELECTOR, _token, _amount, _toChainId, _data)
        );

        require(success, "Bridge failed");
    }
}
