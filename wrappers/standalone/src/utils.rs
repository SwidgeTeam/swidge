pub const PENDING_JOBS_ABI: &str = r#"
    {
        "inputs": [],
        "name": "getPendingJobs",
        "outputs": [
        {
            "components": [
            {
                "internalType": "bytes16",
                "name": "id",
                "type": "bytes16"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "inputAsset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "dstAsset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "srcChain",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "dstChain",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minAmountOut",
                "type": "uint256"
            }
            ],
            "internalType": "struct JobsQueue.ExecuteJob[]",
            "name": "",
            "type": "tuple[]"
        }
        ],
        "stateMutability": "view",
        "type": "function"
    }
    "#;
