import ITokenJson from '@/tokens/models/ITokenJson'
import { ethers } from 'ethers'
import { NATIVE_COIN_ADDRESS } from '@/contracts/routerCaller'

export default class BSCToken {
    public static bscImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg'

    address: string
    symbol: string
    name: string
    decimals: number
    logo: string

    constructor(json: ITokenJson) {
        this.address = json.id
        this.symbol = json.symbol
        this.name = json.name
        this.decimals = json.decimals
        this.logo = json.logo
    }

    public get img() {
        if (this.address === NATIVE_COIN_ADDRESS) {
            return this.logo
        }
        const address = ethers.utils.getAddress(this.address)
        return `https://pancakeswap.finance/images/tokens/${address}.png`
    }

    public replaceByDefault(e: Event) {
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = BSCToken.bscImg
    }
}
