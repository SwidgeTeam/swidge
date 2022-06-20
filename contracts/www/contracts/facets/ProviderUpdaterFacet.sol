//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "../providers/dexs/IDEX.sol";
import "../providers/bridge/IBridge.sol";
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
     * @dev Emitted when a bridge provider address is updated
     */
    event UpdatedBridgeProvider(
        uint8 code,
        address provAddress
    );

    /**
     * @dev Updates the address of a bridge provider contract
     */
    function updateBridgeProvider(LibApp.BridgeCode _code, address _address) external onlyOwner {
        require(_address != address(0), 'ZeroAddress not allowed');
        uint8 code = uint8(_code);
        LibApp.AppStorage storage s = LibApp.appStorage();
        s.bridgeProviders[code] = IBridge(_address);
        emit UpdatedBridgeProvider(code, _address);
    }

    /**
     * @dev Emitted when a swap provider address is updated
     */
    event UpdatedSwapProvider(
        uint8 code,
        address provAddress
    );

    /**
     * @dev Updates the address of a swap provider contract
     */
    function updateSwapProvider(LibApp.DexCode _code, address payable _address) external onlyOwner {
        require(_address != address(0), 'ZeroAddress not allowed');
        uint8 code = uint8(_code);
        LibApp.AppStorage storage s = LibApp.appStorage();
        s.swapProviders[code] = IDEX(_address);
        emit UpdatedSwapProvider(code, _address);
    }

    /**
     * @dev Emitted when the relayer address is updated
     */
    event UpdatedRelayer(
        address oldAddress,
        address newAddress
    );

    /**
     * @dev Updates the address of the authorized relayer
     */
    function updateRelayer(address _relayerAddress) external onlyOwner {
        require(_relayerAddress != address(0), 'ZeroAddress not allowed');
        LibApp.AppStorage storage s = LibApp.appStorage();
        address oldAddress = s.relayerAddress;
        s.relayerAddress = _relayerAddress;
        emit UpdatedRelayer(oldAddress, _relayerAddress);
    }
}
