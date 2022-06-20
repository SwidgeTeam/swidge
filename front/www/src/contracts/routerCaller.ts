import { ethers, ContractTransaction } from 'ethers';
import routerAbi from './router.json';
import IERC20Abi from './IERC20.json';

export interface RouterCallPayload {
    router: string
    amountIn: string
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

export class RouterCaller {

    private static MAX_UINT256 = (2 ** 255).toLocaleString('fullwide', { useGrouping: false });

    static provider() {
        // Get user account
        return new ethers.providers.Web3Provider(window.ethereum);
    }

    static async call(params: RouterCallPayload): Promise<ContractTransaction> {
        const provider = this.provider();
        const nativeInput = params.originSwap.tokenIn === NATIVE_COIN_ADDRESS;

        // Get Router contract instance
        const Router = new ethers.Contract(
            params.router,
            routerAbi,
            provider.getSigner()
        );

        if (!nativeInput) {
            const tokenIn = params.originSwap.required
                ? params.originSwap.tokenIn
                : params.bridge.tokenIn;
            await RouterCaller.approveIfRequired(tokenIn, params.router);
        }

        const feeData = await provider.getFeeData();

        const valueToSend = nativeInput
            ? params.amountIn
            : 0;

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
        );
    }

    /**
     * Approves amount of tokens to be taken by spender address
     * @param tokenAddress
     * @param spender
     */
    static async approveIfRequired(tokenAddress: string, spender: string) {
        const provider = this.provider();
        const signer = provider.getSigner();

        // Get token contract
        const Token = new ethers.Contract(
            tokenAddress,
            IERC20Abi,
            signer
        );

        const allowance = await Token.allowance(window.ethereum.selectedAddress, spender);

        if (allowance.toString() === this.MAX_UINT256) {
            return;
        }

        // Create the transaction
        const tx = await Token.approve(spender, this.MAX_UINT256);

        // Broadcast & wait
        await tx.wait();
    }
}
