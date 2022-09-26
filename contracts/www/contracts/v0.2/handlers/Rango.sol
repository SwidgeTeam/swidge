// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

interface IRangoMessageReceiver {
    enum ProcessStatus {SUCCESS, REFUND_IN_SOURCE, REFUND_IN_DESTINATION}

    function handleRangoMessage(
        address _token,
        uint _amount,
        ProcessStatus _status,
        bytes memory _message
    ) external;
}

interface Core {
    function createJob(bytes calldata _data) external payable;
}

contract Rango is IRangoMessageReceiver {
    address payable constant NULL_ADDRESS = payable(0x0000000000000000000000000000000000000000);
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

    function handleRangoMessage(
        address _token,
        uint _amount,
        ProcessStatus _status,
        bytes memory _message
    ) external {
        if (_status == ProcessStatus.SUCCESS) {
            AppMessage memory m = abi.decode((_message), (AppMessage));
            uint256 value;

            if (_token == NULL_ADDRESS) {
                _amount = address(this).balance;
                value = _amount;
            } else {
                IERC20 asset = IERC20(_token);
                _amount = asset.balanceOf(address(this));
                value = 0;
                SafeERC20.safeTransfer(IERC20(_token), address(core), _amount);
            }

            bytes memory payload = abi.encode(m.receiver, _token, m.dstAsset, m.dstChain, _amount, m.minAmount);

            core.createJob{value : value}(payload);
        }
    }
}
