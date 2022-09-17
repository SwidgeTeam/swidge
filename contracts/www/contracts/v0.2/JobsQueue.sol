// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './libraries/LibBytes.sol';


contract JobsQueue is Ownable {
    address public immutable gelatoOps;
    address constant NATIVE = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    mapping(address => bool) origins;
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
        bool keep;
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
            ExecuteCall memory currentCall = calls[i];
            Job memory job = currentCall.job;
            address handler = currentCall.handler;
            bytes memory data = currentCall.data;

            uint value;
            if (job.inputAsset == NATIVE) {
                value = job.amountIn;
            } else {
                value = 0;
                SafeERC20.safeApprove(IERC20(job.inputAsset), handler, job.amountIn);
            }

            (bool success, bytes memory response) = handler.call{value : value}(data);

            if (success) {
                delete jobs[job.position];
            }
            else {
                emit FailedJob(LibBytes.getRevertMsg(response));
            }
        }
        pruneJobs();
    }

    /**
     * queues a new job into the list
     * @dev this is called by our deployed handlers
     */
    function createJob(bytes calldata _data) external payable {
        if (!origins[msg.sender]) revert UnauthorizedOrigin();

        HandlerMessage memory handlerMsg = abi.decode(_data, (HandlerMessage));

        if (handlerMsg.amountIn == 0) revert JobWithZeroAmount();

        Job memory job = Job(
            handlerMsg.receiver,
            handlerMsg.inputAsset,
            handlerMsg.dstAsset,
            handlerMsg.dstChain,
            handlerMsg.amountIn,
            handlerMsg.minAmountOut,
            jobs.length,
            true
        );

        jobs.push(job);
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
     */
    function getPendingJobs() external view returns (Job[] memory) {
        return jobs;
    }

    /**
     * cleans the jobs that are already executed.
     * are marked by the attribute `keep` to know which ones
     * are to be removed
     */
    function pruneJobs() internal {
        uint256 removed = 0;
        for (uint i = 0; i < jobs.length; i++) {
            Job storage job = jobs[i];
            if (job.keep) {
                if (removed > 0) {// no need to replace by itself
                    uint256 newPosition = i - removed;
                    job.position = newPosition;
                    jobs[newPosition] = job;
                }
            } else {
            unchecked {
                // saves gas, will NEVER have 2^256 jobs on list
                ++removed;
            }
            }
        }
        for (uint i = 0; i < removed; i++) {
            jobs.pop();
        }
    }
}
