//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibStorage.sol";

contract ProviderUpdaterFacet {

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
    function updateBridge(LibStorage.Provider calldata _provider) external {
        LibStorage.enforceIsContractOwner();
        require(_provider.implementation != address(0), 'ZeroAddress not allowed for bridge');
        LibStorage.ProviderStorage storage ps = LibStorage.providers();
        address oldAddress = ps.bridgeProviders[_provider.code].implementation;
        ps.bridgeProviders[_provider.code] = _provider;
        emit UpdatedBridgeProvider(_provider.code, oldAddress, _provider.implementation);
    }

    /**
     * @dev Updates the address of the authorized relayer
     */
    function updateSwapper(LibStorage.Provider calldata _provider) external {
        LibStorage.enforceIsContractOwner();
        require(_provider.implementation != address(0), 'ZeroAddress not allowed for bridge');
        LibStorage.ProviderStorage storage ps = LibStorage.providers();
        address oldAddress = ps.swapProviders[_provider.code].implementation;
        ps.swapProviders[_provider.code] = _provider;
        emit UpdatedSwapProvider(_provider.code, oldAddress, _provider.implementation);
    }

    /**
     * @dev Lists all the bridge providers and its details
     */
    function listBridges() external view returns (LibStorage.Provider[] memory) {
        LibStorage.ProviderStorage storage ps = LibStorage.providers();
        LibStorage.Provider[] memory bridges = new LibStorage.Provider[](1);
        for (uint8 index; index < 1; index++) {
            LibStorage.Provider memory bridge = ps.bridgeProviders[index];
            bridges[index].code = bridge.code;
            bridges[index].enabled = bridge.enabled;
            bridges[index].implementation = bridge.implementation;
            bridges[index].handler = bridge.handler;
        }
        return bridges;
    }

    /**
     * @dev Lists all the bridge providers and its details
     */
    function listSwappers() external view returns (LibStorage.Provider[] memory) {
        LibStorage.ProviderStorage storage ps = LibStorage.providers();
        LibStorage.Provider[] memory swappers = new LibStorage.Provider[](1);
        for (uint8 index; index < 1; index++) {
            LibStorage.Provider memory swap = ps.swapProviders[index];
            swappers[index].code = swap.code;
            swappers[index].enabled = swap.enabled;
            swappers[index].implementation = swap.implementation;
            swappers[index].handler = swap.handler;
        }
        return swappers;
    }

}
