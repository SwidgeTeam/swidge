import { ContractTransaction, ethers } from 'ethers'
import Route, { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { JsonRpcSigner } from '@ethersproject/providers/src.ts/json-rpc-provider'

export class ContractCaller {
    /**
     * Execute all the necessary transactions for this route
     * @param route
     */
    static async executeRoute(route: Route): Promise<ContractTransaction> {
        if (!route.tx) {
            throw new Error('trying to execute an empty transaction')
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer: JsonRpcSigner = provider.getSigner()
        const feeData = await provider.getFeeData()

        if (!feeData.gasPrice) {
            throw new Error('error fetching gas')
        }

        if (route.approvalTx) {
            const approvalTx = await signer.sendTransaction({
                to: route.approvalTx.to,
                data: route.approvalTx.callData,
                gasLimit: route.approvalTx.gasLimit,
                gasPrice: feeData.gasPrice,
            })
            await approvalTx.wait()
        }

        return await signer.sendTransaction({
            to: route.tx.to,
            data: route.tx.callData,
            value: route.tx.value,
            gasLimit: route.tx.gasLimit,
            gasPrice: feeData.gasPrice,
        })
    }

    /**
     * Executes an approval transaction
     * @param approvalTx
     */
    static async executeApproval(approvalTx: ApprovalTransactionDetails): Promise<TransactionReceipt> {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const feeData = await provider.getFeeData()

        if (!feeData.gasPrice) {
            throw new Error('error fetching gas')
        }

        return (
            await signer.sendTransaction({
                to: approvalTx.to,
                data: approvalTx.callData,
                gasLimit: approvalTx.gasLimit,
                gasPrice: feeData.gasPrice,
            })
        ).wait()
    }

    /**
     * Executes the main transaction for the process
     * @param tx
     */
    static async executeTransaction(tx: TransactionDetails): Promise<TransactionReceipt> {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const feeData = await provider.getFeeData()

        if (!feeData.gasPrice) {
            throw new Error('error fetching gas')
        }

        return (
            await signer.sendTransaction({
                to: tx.to,
                data: tx.callData,
                value: tx.value,
                gasLimit: tx.gasLimit,
                gasPrice: feeData.gasPrice,
            })
        ).wait()
    }
}
