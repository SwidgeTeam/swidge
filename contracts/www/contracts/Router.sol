//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./providers/dexs/IDEX.sol";
import "./providers/bridge/IBridge.sol";

contract Router is Ownable {
    address private NATIVE_TOKEN_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    address private relayerAddress;
    mapping(uint8 => IBridge) private bridgeProviders;
    mapping(uint8 => IDEX) private swapProviders;

    enum dexCode {
        ZeroEx // 0
    }

    enum bridgeCode {
        Anyswap // 0
    }

    /**
     * @dev Throws if called by any account other than the relayer.
     */
    modifier onlyRelayer() {
        require(relayerAddress == _msgSender(), "Caller is not the relayer");
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
     * @dev Emitted when a swap provider address is updated
     */
    event UpdatedSwapProvider(
        uint8 code,
        address provAddress
    );

    /**
     * @dev Emitted when the relayer address is updated
     */
    event UpdatedRelayer(
        address oldAddress,
        address newAddress
    );

    /**
     * @dev Emitted when a multi-chain swap is initiated
     */
    event CrossInitiated(
        address srcToken,
        address bridgeTokenIn,
        address bridgeTokenOut,
        address dstToken,
        uint256 fromChain,
        uint256 toChain,
        uint256 amountIn,
        uint256 amountCross
    );

    /**
     * @dev Emitted when a single-chain swap is completed
     */
    event SwapExecuted(
        address srcToken,
        address dstToken,
        uint256 chainId,
        uint256 amountIn,
        uint256 amountOut
    );

    /**
     * @dev Emitted when a multi-chain swap is finalized
     */
    event CrossFinalized(
        string txHash,
        uint256 amountOut
    );

    /**
     * @dev Defines the details for the swap step
     */
    struct SwapStep {
        uint8 providerCode;
        address tokenIn;
        address tokenOut;
        bytes data;
        bool required;
    }

    /**
     * @dev Defines the details for the bridge step
     */
    struct BridgeStep {
        address tokenIn;
        uint256 toChainId;
        bytes data;
        bool required;
    }

    /**
     * @dev Defines the details for the destination swap
     */
    struct DestinationSwap {
        address tokenIn;
        address tokenOut;
    }

    /**
     * Init the process of swidging
     * @dev This function is executed on the origin chain
     */
    function initSwidge(
        uint256 _amount,
        SwapStep calldata _swapStep,
        BridgeStep calldata _bridgeStep,
        DestinationSwap calldata _destinationSwap
    ) external payable {
        // We need either the swap or the bridge step to be required
        require(_swapStep.required || _bridgeStep.required, "No required actions");

        address tokenToTakeIn;
        // Need to check which token is going to be taken as input
        if (_swapStep.required) {
            tokenToTakeIn = _swapStep.tokenIn;
        }
        else {
            tokenToTakeIn = _bridgeStep.tokenIn;
        }

        if (tokenToTakeIn != NATIVE_TOKEN_ADDRESS) {
            // Take ownership of user's tokens
            TransferHelper.safeTransferFrom(
                tokenToTakeIn,
                msg.sender,
                address(this),
                _amount
            );
        }

        uint256 finalAmount;
        // Store the amount for the next step
        // depending on the step to take
        if (_swapStep.required) {
            IDEX swapper = swapProviders[_swapStep.providerCode];

            uint256 valueToSend;
            // Check the native coins value that we have to forward to the swap impl
            if (_swapStep.tokenIn == NATIVE_TOKEN_ADDRESS) {
                valueToSend = _amount;
            }
            else {
                valueToSend = msg.value;
                // Approve swapper contract
                TransferHelper.safeApprove(
                    _swapStep.tokenIn,
                    address(swapper),
                    _amount
                );
            }

            // Execute the swap
            finalAmount = swapper.swap{value : valueToSend}(
                _swapStep.tokenIn,
                _swapStep.tokenOut,
                address(this),
                _amount,
                _swapStep.data
            );
        }
        else {
            // If swap is not required the amount going
            // to the bridge is the same that came in
            finalAmount = _amount;
        }

        if (_bridgeStep.required) {
            // Load selected bridge provider
            IBridge bridge = bridgeProviders[uint8(bridgeCode.Anyswap)];

            // Approve tokens for the bridge to take
            TransferHelper.safeApprove(
                _bridgeStep.tokenIn,
                address(bridge),
                finalAmount
            );

            // Execute bridge process
            bridge.send(
                _bridgeStep.tokenIn,
                address(this),
                finalAmount,
                _bridgeStep.toChainId,
                _bridgeStep.data
            );

            // Emit event for relayer
            emit CrossInitiated(
                _swapStep.tokenIn,
                _bridgeStep.tokenIn,
                _destinationSwap.tokenIn,
                _destinationSwap.tokenOut,
                block.chainid,
                _bridgeStep.toChainId,
                _amount,
                finalAmount
            );
        }
        else {
            // Bridging is not required, means we are not changing network
            // so we send the assets back to the user
            if (_swapStep.tokenOut == NATIVE_TOKEN_ADDRESS) {
                payable(msg.sender).transfer(finalAmount);
            }
            else {
                TransferHelper.safeTransfer(_swapStep.tokenOut, msg.sender, finalAmount);
            }
            // We surely did a swap,
            // so in this case we inform of it
            emit SwapExecuted(
                _swapStep.tokenIn,
                _swapStep.tokenOut,
                block.chainid,
                _amount,
                finalAmount
            );
        }
    }

    /**
     * Finalize the process of swidging
     * @dev This function is executed on the destination chain
     */
    function finalizeSwidge(
        uint256 _amount,
        address _receiver,
        string calldata _originHash,
        SwapStep calldata _swapStep
    ) external payable onlyRelayer {

        uint256 finalAmount;
        // Check if last swap is required,
        // and store final user-reaching amount
        if (_swapStep.required) {
            IDEX swapper = swapProviders[_swapStep.providerCode];

            // Approve swapper contract
            TransferHelper.safeApprove(
                _swapStep.tokenIn,
                address(swapper),
                _amount
            );

            finalAmount = swapper.swap(
                _swapStep.tokenIn,
                _swapStep.tokenOut,
                address(this),
                _amount,
                _swapStep.data
            );
        }
        else {
            finalAmount = _amount;
        }

        if (_swapStep.tokenOut == NATIVE_TOKEN_ADDRESS) {
            // Sent native coins
            payable(_receiver).transfer(finalAmount);
        }
        else {
            // Send tokens to the user
            TransferHelper.safeTransfer(
                _swapStep.tokenOut,
                _receiver,
                finalAmount
            );
        }

        emit CrossFinalized(_originHash, finalAmount);
    }

    /**
     * @dev Updates the address of a bridge provider contract
     */
    function updateBridgeProvider(bridgeCode _code, address _address) external onlyOwner {
        require(_address != address(0), 'ZeroAddress not allowed');
        uint8 code = uint8(_code);
        bridgeProviders[code] = IBridge(_address);
        emit UpdatedBridgeProvider(code, _address);
    }

    /**
     * @dev Updates the address of a swap provider contract
     */
    function updateSwapProvider(dexCode _code, address payable _address) external onlyOwner {
        require(_address != address(0), 'ZeroAddress not allowed');
        uint8 code = uint8(_code);
        swapProviders[code] = IDEX(_address);
        emit UpdatedSwapProvider(code, _address);
    }

    /**
     * @dev Updates the address of the authorized relayer
     */
    function updateRelayer(address _relayerAddress) external onlyOwner {
        require(_relayerAddress != address(0), 'ZeroAddress not allowed');
        address oldAddress = relayerAddress;
        relayerAddress = _relayerAddress;
        emit UpdatedRelayer(oldAddress, relayerAddress);
    }

    /**
     * @dev To retrieve any tokens that got stuck on the contract
     */
    function retrieve(address _token, uint256 _amount) external onlyOwner {
        TransferHelper.safeTransfer(_token, msg.sender, _amount);
    }

    /**
     * To allow this contract to receive natives from the swapper impl
     */
    receive() external payable {}
}
