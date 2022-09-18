// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './libraries/LibBytes.sol';


contract JobsQueue is Ownable {
    address public immutable gelatoOps;
    address constant NATIVE = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    mapping(address => bool) origins;
    mapping(bytes32 => bool) remainingJobs;
    Job[] public jobs;

    error UnauthorizedOrigin();
    error UnauthorizedExecutor();
    error JobWithZeroAmount();

    event FailedJob(string msg);

    struct HandlerMessage {
        address receiver;
        address inputAsset;
        address dstAsset;
        uint256 dstChain;
        uint256 amountIn;
        uint256 minAmountOut;
    }

    struct Job {
        address receiver;
        address inputAsset;
        address dstAsset;
        uint256 dstChain;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 position;
        bytes32 hash;
    }

    struct ExecuteCall {
        Job job;
        address handler;
        bytes data;
    }

    constructor(address _ops) {
        gelatoOps = _ops;
    }

    modifier onlyGelato() {
        if (msg.sender != gelatoOps) {
            revert UnauthorizedExecutor();
        }
        _;
    }

    /**
     * executes the some of the given jobs
     * @dev this is executed by Gelato Network
     */
    function executeJobs(ExecuteCall[] calldata calls) external onlyGelato {
        for (uint i = 0; i < calls.length; i++) {
            // unwrap job
            ExecuteCall memory currentCall = calls[i];
            Job memory job = currentCall.job;
            // check job is still remaining
            if (remainingJobs[job.hash]) {
                // unwrap call data
                address handler = currentCall.handler;
                bytes memory data = currentCall.data;

                uint value;
                // decide value and token approval
                if (job.inputAsset == NATIVE) {
                    value = job.amountIn;
                } else {
                    value = 0;
                    SafeERC20.safeApprove(IERC20(job.inputAsset), handler, job.amountIn);
                }

                // execute
                (bool success, bytes memory response) = handler.call{value : value}(data);

                if (success) {
                    delete jobs[job.position];
                    delete remainingJobs[job.hash];
                }
                else {
                    emit FailedJob(LibBytes.getRevertMsg(response));
                }
            }
        }
    }

    /**
     * queues a new job into the list
     * @dev this is called by our deployed handlers
     */
    function createJob(bytes calldata _data) external payable {
        if (!origins[msg.sender]) revert UnauthorizedOrigin();

        HandlerMessage memory handlerMsg = abi.decode(_data, (HandlerMessage));

        if (handlerMsg.amountIn == 0) revert JobWithZeroAmount();

        uint256 currentLength = jobs.length;

        bytes32 hash = keccak256(
            abi.encode(
                handlerMsg.receiver,
                handlerMsg.inputAsset,
                handlerMsg.dstAsset,
                handlerMsg.dstChain,
                handlerMsg.amountIn,
                handlerMsg.minAmountOut,
                currentLength
            )
        );

        Job memory job = Job(
            handlerMsg.receiver,
            handlerMsg.inputAsset,
            handlerMsg.dstAsset,
            handlerMsg.dstChain,
            handlerMsg.amountIn,
            handlerMsg.minAmountOut,
            currentLength,
            hash
        );

        jobs.push(job);
        remainingJobs[hash] = true;
    }

    /**
     * updates the allowed addresses to create jobs
     */
    function updateOrigins(address[] calldata _origins) external onlyOwner {
        for (uint i = 0; i < _origins.length; i++) {
            origins[_origins[i]] = true;
        }
    }

    /**
     * returns a list of pending jobs
     * @dev this function is only called from off-chain actor
     * @dev so we can afford to be a bit inefficient to get the list
     */
    function getPendingJobs() external view returns (Job[] memory) {
        // compute array size
        uint total = 0;
        for (uint i = 0; i < jobs.length; i++) {
            Job storage job = jobs[i];
            if (remainingJobs[job.hash]) {
                ++total;
            }
        }
        Job[] memory returnJobs = new Job[](total);
        // fill array
        total = 0;
        for (uint i = 0; i < jobs.length; i++) {
            Job storage job = jobs[i];
            if (remainingJobs[job.hash]) {
                returnJobs[total] = job;
                ++total;
            }
        }
        return returnJobs;
    }
}
