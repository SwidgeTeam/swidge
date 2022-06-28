//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";
import "../libraries/LibApp.sol";
import "../libraries/LibBridge.sol";

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
     * @dev Updates the address of the authorized relayer
     */
    function updateBridge(LibApp.Provider calldata _provider) external onlyOwner {
        require(_provider.contractAddress != address(0), 'ZeroAddress not allowed for bridge');
        LibApp.AppStorage storage s = LibApp.appStorage();
        address oldAddress = s.bridgeProviders[_provider.code].contractAddress;
        s.bridgeProviders[_provider.code] = _provider;
        emit UpdatedBridgeProvider(_provider.code, oldAddress, _provider.contractAddress);
    }
}
