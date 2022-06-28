//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";
import "../libraries/LibApp.sol";

contract ProviderUpdaterFacet {

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        LibDiamond.enforceIsContractOwner();
        _;
    }

    /**
     * @dev Emitted when the relayer address is updated
     */
    event UpdatedBridgeProvider(
        uint8 code,
        address oldAddress,
        address newAddress
    );

    /**
     * @dev Emitted when the relayer address is updated
     */
    event UpdatedSwapProvider(
        uint8 code,
        address oldAddress,
        address newAddress
    );

    /**
     * @dev Updates the address of the authorized relayer
     */
    function updateBridge(LibApp.Provider calldata _provider) external onlyOwner {
        require(_provider.implementation != address(0), 'ZeroAddress not allowed for bridge');
        LibApp.AppStorage storage s = LibApp.appStorage();
        address oldAddress = s.bridgeProviders[_provider.code].implementation;
        s.bridgeProviders[_provider.code] = _provider;
        emit UpdatedBridgeProvider(_provider.code, oldAddress, _provider.implementation);
    }

    /**
     * @dev Updates the address of the authorized relayer
     */
    function updateSwapper(LibApp.Provider calldata _provider) external onlyOwner {
        require(_provider.implementation != address(0), 'ZeroAddress not allowed for bridge');
        LibApp.AppStorage storage s = LibApp.appStorage();
        address oldAddress = s.swapProviders[_provider.code].implementation;
        s.swapProviders[_provider.code] = _provider;
        emit UpdatedSwapProvider(_provider.code, oldAddress, _provider.implementation);
    }

    /**
     * @dev Lists all the bridge providers and its details
     */
    function listBridges() external view returns (LibApp.Provider[] memory) {
        LibApp.AppStorage storage s = LibApp.appStorage();
        LibApp.Provider[] memory bridges = new LibApp.Provider[](1);
        for (uint8 index; index < 1; index++) {
            LibApp.Provider memory bridge = s.bridgeProviders[index];
            bridges[index].code = bridge.code;
            bridges[index].enabled = bridge.enabled;
            bridges[index].implementation = bridge.implementation;
            bridges[index].handler = bridge.handler;
        }
        return bridges;
    }

}
