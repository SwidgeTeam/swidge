// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './libraries/LibBytes.sol';
import 'hardhat/console.sol';


contract JobsQueue is Ownable {
    address constant NATIVE = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    mapping(address => bool) origins;
    Job[] public jobs;

    error UnauthorizedOrigin();
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

    function executeJobs(ExecuteCall[] calldata calls) external {
        for (uint i = 0; i < calls.length; i++) {
            Job memory job = calls[i].job;
            address handler = calls[i].handler;
            bytes memory data = calls[i].data;

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
     *
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

    function updateOrigins(address[] calldata _origins) external onlyOwner {
        for (uint i = 0; i < _origins.length; i++) {
            origins[_origins[i]] = true;
        }
    }

    function getPendingJobs() external view returns (Job[] memory) {
        return jobs;
    }

    function pruneJobs() internal {
        uint256 removed = 0;
        for (uint i = 0; i < jobs.length; i++) {
            Job storage job = jobs[i];
            if (job.keep) {
                if (removed > 0) {
                    job.position = job.position - removed;
                    jobs[i - removed] = job;
                }
            } else {
            unchecked {
                ++removed;
            }
            }
        }
        for (uint i = 0; i < removed; i++) {
            jobs.pop();
        }
    }
}
