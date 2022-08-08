import { ethers, ContractTransaction } from 'ethers'
import IERC20Abi from './IERC20.json'
import { TransactionDetails } from '@/domain/paths/path'

export const NATIVE_COIN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export class RouterCaller {

    static provider() {
        // Get user account
        return new ethers.providers.Web3Provider(window.ethereum)
    }

    static async call(tx: TransactionDetails): Promise<ContractTransaction> {
        const provider = this.provider()
        const signer = provider.getSigner()

        await RouterCaller.approveIfRequired(tokenIn, tx.to)

        const txResponse = await signer.sendTransaction({
            to: tx.to,
            data: tx.callData,
            value: tx.value,
            gasLimit: tx.gasLimit,
            gasPrice: tx.gasPrice,
        })

        return txResponse
    }

    /**
     * Approves amount of tokens to be taken by spender address
     * @param tokenAddress
     * @param spender
     */
    static async approveIfRequired(tokenAddress: string, spender: string) {
        const provider = this.provider()
        const signer = provider.getSigner()

        // Get token contract
        const Token = new ethers.Contract(
            tokenAddress,
            IERC20Abi,
            signer
        )

        const allowance = await Token.allowance(window.ethereum.selectedAddress, spender)

        if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
            return
        }

        // Create the transaction
        const tx = await Token.approve(spender, ethers.constants.MaxUint256)

        // Broadcast & wait
        await tx.wait()
    }
}
