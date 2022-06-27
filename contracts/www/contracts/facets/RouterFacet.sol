//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "../libraries/LibStorage.sol";
import "../libraries/LibProvider.sol";

contract RouterFacet {

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

        if (tokenToTakeIn != nativeToken()) {
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
            // Execute the swap
            finalAmount = LibProvider.swap(
                _swapStep.providerCode,
                _swapStep.tokenIn,
                _swapStep.tokenOut,
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
            // Execute bridge process
            LibProvider.bridge(
                0, // TODO : from input
                _bridgeStep.tokenIn,
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
            if (_swapStep.tokenOut == nativeToken()) {
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
        uint256 _txFee,
        address _receiver,
        string calldata _originHash,
        SwapStep calldata _swapStep
    ) external payable {
        LibStorage.enforceIsRelayer();

        // Store the amount of tokens we keep for the tx fee
        // they will be taken to the relayer wallet on a different process
        LibStorage.fees().fees[_swapStep.tokenIn] = _txFee;

        uint256 finalAmount;
        // Check if last swap is required,
        // and store user's receiving amount
        if (_swapStep.required) {
            finalAmount = LibProvider.swap(
                _swapStep.providerCode,
                _swapStep.tokenIn,
                _swapStep.tokenOut,
                _amount,
                _swapStep.data
            );
        }
        else {
            finalAmount = _amount;
        }

        if (_swapStep.tokenOut == nativeToken()) {
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
     * @dev just a shortcut
     */
    function nativeToken() internal pure returns (address){
        return LibProvider.nativeToken();
    }

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
     * @dev To retrieve any tokens that got stuck on the contract
     */
    function retrieve(address _token, uint256 _amount) external {
        LibStorage.enforceIsContractOwner();
        TransferHelper.safeTransfer(_token, msg.sender, _amount);
    }
}
