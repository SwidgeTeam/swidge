import { ethers, Signer } from 'ethers'
import { ApprovalTransactionDetails, TransactionDetails } from '@/domain/paths/path'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

export class ContractCaller {
    /**
     * Executes an approval transaction
     * @param approvalTx
     */
    static async executeApproval(approvalTx: ApprovalTransactionDetails): Promise<TransactionReceipt> {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer: Signer = provider.getSigner()
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
        const signer: Signer = provider.getSigner()
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
