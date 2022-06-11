//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

abstract contract Provider is Ownable {
    address private router;

    modifier onlyRouter() {
        require(msg.sender == router, "Unauthorized caller");
        _;
    }

    event UpdatedRouter(address indexed oldAddress, address indexed newAddress);

    function updateRouter(address _routerAddress) external onlyOwner {
        require(address(0) != _routerAddress, 'No ZeroAddress allowed');
        address oldAddress = router;
        router = _routerAddress;
        emit UpdatedRouter(oldAddress, _routerAddress);
    }

    function retrieve(address _token, uint256 _amount) external onlyOwner {
        TransferHelper.safeTransfer(_token, msg.sender, _amount);
    }
}
