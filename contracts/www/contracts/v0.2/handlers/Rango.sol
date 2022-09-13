pragma solidity ^0.8.17;

interface IRangoMessageReceiver {
    enum ProcessStatus {SUCCESS, REFUND_IN_SOURCE, REFUND_IN_DESTINATION}

    function handleRangoMessage(
        address _token,
        uint _amount,
        ProcessStatus _status,
        bytes memory _message
    ) external;
}

contract Rango is IRangoMessageReceiver {
    address payable constant NULL_ADDRESS = payable(0x0000000000000000000000000000000000000000);
    address payable coreContract;

    struct AppMessage {
        address srcAsset;
        address dstAsset;
        uint256 srcChain;
        uint256 dstChain;
        uint256 minAmount;
    }

    constructor(address payable _coreContract) {
        coreContract = _coreContract;
    }

    receive() external payable {}

    function handleRangoMessage(
        address _token,
        uint _amount,
        ProcessStatus _status,
        bytes memory _message
    ) external {
        AppMessage memory m = abi.decode((_message), (AppMessage));

        if (_token == NULL_ADDRESS) {

        } else {

        }
    }

}
