pragma solidity ^0.8.0;

interface IDEX {
    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        bytes memory _data
    ) external returns (uint256);
}
