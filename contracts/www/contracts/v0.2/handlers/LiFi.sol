// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

interface Core {
    function createJob(bytes calldata _data) external payable;
}

contract LiFi {
    address constant NATIVE = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    Core core;

    struct AppMessage {
        address receiver;
        address inputAsset;
        address dstAsset;
        uint256 dstChain;
        uint256 minAmount;
    }

    constructor(address payable _coreContract) {
        core = Core(_coreContract);
    }

    function handleTransfer(bytes calldata _message) external {
        AppMessage memory m = abi.decode((_message), (AppMessage));
        uint amount;
        uint value;

        if (m.inputAsset == NATIVE) {
            amount = address(this).balance;
            value = amount;
        } else {
            IERC20 asset = IERC20(m.inputAsset);
            amount = asset.balanceOf(address(this));
            value = 0;
            SafeERC20.safeTransfer(asset, address(core), amount);
        }

        bytes memory payload = abi.encode(m.receiver, m.inputAsset, m.dstAsset, m.dstChain, amount, m.minAmount);

        core.createJob{value : amount}(payload);
    }
}
