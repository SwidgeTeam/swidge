pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./IBridge.sol";

contract Anyswap is IBridge {
    address private anyswapV4Router;

    constructor(address _anyswapV3Router){
        anyswapV4Router = _anyswapV3Router;
    }

    function send(
        address _token,
        uint256 _amount,
        uint256 _toChainId,
        bytes memory _data
    ) external override {
        // Approve tokens for the bridge to take
        TransferHelper.safeApprove(_token, anyswapV4Router, _amount);

        // Decode data to get address of custom token
        address _anyTokenAddress = abi.decode(_data, (address));

        // bytes4(keccak256(bytes('anySwapOutUnderlying(address,address,uint256,uint256)')))
        (bool success,) = anyswapV4Router.call(
            abi.encodeWithSelector(0xedbdf5e2, _anyTokenAddress, address(this), _amount, _toChainId)
        );

        require(success, "Bridge failed");
    }
}
