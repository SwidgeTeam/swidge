// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibApp {
    bytes32 constant APP_STORAGE_POSITION = keccak256("xyz.swidge.app.storage");
    address constant NATIVE_TOKEN_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    struct AppStorage {
        address relayerAddress;
        mapping(uint8 => Provider) bridgeProviders;
        mapping(uint8 => Provider) swapProviders;
    }

    struct Provider {
        uint8 code;
        bool enabled;
        address contractAddress;
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
}
