import { ethers, ContractTransaction, BigNumber } from 'ethers'
import routerAbi from './router.json'
import IERC20Abi from './IERC20.json'

export interface RouterCallPayload {
    amountIn: BigNumber
    destinationFee: BigNumber
    originSwap: {
        providerCode: string
        tokenIn: string
        tokenOut: string
        data: string
        required: boolean
        estimatedGas: string
    },
    bridge: {
        tokenIn: string
        toChainId: string
        data: string
        required: boolean
    },
    destinationSwap: {
        tokenIn: string
        tokenOut: string
    }
}

export const NATIVE_COIN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const ROUTER_ADDRESS = '0x1a6e1ef1d28A7d9feD016c88f4d1858367564781'

export class RouterCaller {

    static provider() {
        // Get user account
        return new ethers.providers.Web3Provider(window.ethereum)
    }

    static async call(params: RouterCallPayload): Promise<ContractTransaction> {
        const provider = this.provider()
        const nativeInput = params.originSwap.tokenIn === NATIVE_COIN_ADDRESS

        // Get Router contract instance
        const Router = new ethers.Contract(
            ROUTER_ADDRESS,
            routerAbi,
            provider.getSigner()
        )

        if (!nativeInput) {
            const tokenIn = params.originSwap.required
                ? params.originSwap.tokenIn
                : params.bridge.tokenIn
            await RouterCaller.approveIfRequired(tokenIn)
        }

        const feeData = await provider.getFeeData()

        let valueToSend = params.destinationFee

        if (nativeInput) {
            valueToSend = valueToSend.add(params.amountIn)
        }

        // Create transaction
        return Router.initSwidge(
            params.amountIn,
            [
                params.originSwap.providerCode,
                params.originSwap.tokenIn,
                params.originSwap.tokenOut,
                params.originSwap.data,
                params.originSwap.required,
            ],
            [
                params.bridge.tokenIn,
                params.bridge.toChainId,
                params.bridge.data,
                params.bridge.required,
            ],
            [
                params.destinationSwap.tokenIn,
                params.destinationSwap.tokenOut
            ],
            {
                gasPrice: feeData.gasPrice,
                gasLimit: 2000000, // TODO : set more accurate
                value: valueToSend
            }
        )
    }

    /**
     * Approves amount of tokens to be taken by spender address
     * @param tokenAddress
     */
    static async approveIfRequired(tokenAddress: string) {
        const provider = this.provider()
        const signer = provider.getSigner()

        // Get token contract
        const Token = new ethers.Contract(
            tokenAddress,
            IERC20Abi,
            signer
        )

        const allowance = await Token.allowance(window.ethereum.selectedAddress, ROUTER_ADDRESS)

        if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
            return
        }

        // Create the transaction
        const tx = await Token.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256)

        // Broadcast & wait
        await tx.wait()
    }
}
