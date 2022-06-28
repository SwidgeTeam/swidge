pragma solidity ^0.8.0;

interface IDEX {
    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        bytes calldata _data
    ) external payable returns (uint256);
}
