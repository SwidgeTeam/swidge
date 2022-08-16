import { ContractTransaction, ethers } from 'ethers'
import { TransactionDetails } from '@/domain/paths/path'

export const NATIVE_COIN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export class RouterCaller {
    static async call(tx: TransactionDetails): Promise<ContractTransaction> {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        return await signer.sendTransaction({
            to: tx.to,
            data: tx.callData,
            value: tx.value,
            gasLimit: tx.gasLimit,
            gasPrice: tx.gasPrice,
        })
    }
}
