// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './libraries/LibBytes.sol';
import "./interfaces/IJobsQueue.sol";

contract JobsQueue is Ownable, IJobsQueue {
    address public immutable gelatoProxy;
    address constant NATIVE = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    mapping(address => bool) origins;
    mapping(bytes32 => uint256) jobsPosition; // jobId -> job array position
    mapping(bytes16 => bool) usedJobIds; // whether a jobId is in use already
    Job[] private jobs;

    error UnauthorizedOrigin();
    error UnauthorizedExecutor();
    error JobWithZeroAmount();
    error JobWithNoReceiver();
    error JobIdInUse();

    event Success(bytes16 indexed id);
    event Fail(bytes16 indexed id, string msg);

    struct HandlerMessage {
        bytes16 id;
        address receiver;
        address inputAsset;
        address dstAsset;
        uint256 dstChain;
        uint256 amountIn;
        uint256 minAmountOut;
    }

    struct Job {
        bytes16 id;
        address receiver;
        address inputAsset;
        address dstAsset;
        uint256 dstChain;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 position;
    }

    struct ExecuteJob {
        bytes16 id;
        address sender;
        address receiver;
        address inputAsset;
        address dstAsset;
        uint256 srcChain;
        uint256 dstChain;
        uint256 amountIn;
        uint256 minAmountOut;
    }

    struct ExecuteCall {
        bytes16 jobId;
        address handler;
        bytes data;
    }

    constructor(address _ops) {
        gelatoProxy = _ops;
    }

    modifier onlyGelato() {
        if (msg.sender != gelatoProxy) {
            revert UnauthorizedExecutor();
        }
        _;
    }

    /**
     * executes the some of the given jobs
     * @dev this is executed by Gelato Network
     */
    function executeJobs(ExecuteCall[] calldata calls) external onlyGelato {
        ExecuteCall memory currentCall;
        Job storage job;
        uint256 valueToSend;
        uint256 callsLength = calls.length;

        for (uint i = 0; i < callsLength; i++) {
            // unwrap job
            currentCall = calls[i];
            job = jobs[jobsPosition[currentCall.jobId]];

            // check job is still remaining
            if (usedJobIds[job.id]) {
                // decide value and token approval
                if (job.inputAsset == NATIVE) {
                    valueToSend = job.amountIn;
                } else {
                    valueToSend = 0;
                    SafeERC20.safeApprove(IERC20(job.inputAsset), currentCall.handler, job.amountIn);
                }

                // execute
                (bool success, bytes memory response) = currentCall.handler.call{value : valueToSend}(currentCall.data);

                delete jobs[job.position];
                delete jobsPosition[job.id];
                delete usedJobIds[job.id];

                if (success) {
                    emit Success(job.id);
                }
                else {
                    emit Fail(job.id, LibBytes.getRevertMsg(response));
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

        if (usedJobIds[handlerMsg.id]) revert JobIdInUse();
        if (handlerMsg.receiver == address(0)) revert JobWithNoReceiver();
        if (handlerMsg.amountIn == 0) revert JobWithZeroAmount();

        uint256 currentLength = jobs.length;
        uint256 emptySlot = _getEmptySlot(currentLength);

        Job memory job = Job(
            handlerMsg.id,
            handlerMsg.receiver,
            handlerMsg.inputAsset,
            handlerMsg.dstAsset,
            handlerMsg.dstChain,
            handlerMsg.amountIn,
            handlerMsg.minAmountOut,
            emptySlot
        );

        if (emptySlot == currentLength) {
            jobs.push(job);
        }
        else {
            jobs[emptySlot] = job;
        }
        jobsPosition[job.id] = emptySlot;
        usedJobIds[job.id] = true;
    }

    /**
     * returns the next usable slot on the jobs array
     */
    function _getEmptySlot(uint256 currentLength) internal view returns (uint256) {
        Job storage job;
        for (uint i = 0; i < currentLength; i++) {
            job = jobs[i];
            if (!usedJobIds[job.id]) {
                return i;
            }
        }
        return currentLength;
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
    function getPendingJobs() external view returns (ExecuteJob[] memory) {
        // compute array size
        uint total = 0;
        for (uint i = 0; i < jobs.length; i++) {
            Job storage job = jobs[i];
            if (usedJobIds[job.id]) {
                ++total;
            }
        }
        ExecuteJob[] memory returnJobs = new ExecuteJob[](total);
        // fill array
        total = 0;
        for (uint i = 0; i < jobs.length; i++) {
            Job storage job = jobs[i];
            if (usedJobIds[job.id]) {
                returnJobs[total] = ExecuteJob(
                    job.id,
                    address(this),
                    job.receiver,
                    job.inputAsset,
                    job.dstAsset,
                    block.chainid,
                    job.dstChain,
                    job.amountIn,
                    job.minAmountOut
                );
                ++total;
            }
        }
        return returnJobs;
    }
}