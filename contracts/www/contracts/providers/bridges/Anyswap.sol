pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./IBridge.sol";
import "../../libraries/LibApp.sol";

contract Anyswap is IBridge {
    function send(
        address _token,
        uint256 _amount,
        uint256 _toChainId,
        bytes calldata _data
    ) external override returns (bool){
        LibApp.Provider memory bridge = LibApp.getBridge(uint8(LibApp.BridgeCode.Anyswap));

        // Approve tokens for the bridge to take
        TransferHelper.safeApprove(_token, bridge.handler, _amount);

        // Decode data to get address of custom token
        address _anyTokenAddress = abi.decode(_data, (address));

        // bytes4(keccak256(bytes('anySwapOutUnderlying(address,address,uint256,uint256)')));

        (bool success,) = bridge.handler.call(
            abi.encodeWithSelector(0xedbdf5e2, _anyTokenAddress, address(this), _amount, _toChainId)
        );

        require(success, "Bridge: Anyswap failed");

        return true;
    }
}
