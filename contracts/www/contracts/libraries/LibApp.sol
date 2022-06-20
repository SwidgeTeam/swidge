// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../providers/bridge/IBridge.sol";
import "../providers/dexs/IDEX.sol";

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
        mapping(uint8 => IBridge) bridgeProviders;
        mapping(uint8 => IDEX) swapProviders;
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

    function getSwapProvider(uint8 _code) internal view returns (IDEX) {
        return appStorage().swapProviders[_code];
    }

    function getBridgeProvider(uint8 _code) internal view returns (IBridge) {
        return appStorage().bridgeProviders[_code];
    }
}
