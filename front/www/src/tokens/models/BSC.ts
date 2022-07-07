import IToken from './IToken'
import ITokenJson from '@/tokens/models/ITokenJson'
import { ethers } from 'ethers'

export default class BSCToken implements IToken {
    public static bscImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg'

    address: string
    symbol: string
    name: string
    decimals: number

    constructor(json: ITokenJson) {
        this.address = json.id
        this.symbol = json.symbol
        this.name = json.name
        this.decimals = json.decimals
    }

    public get img() {
        const address = ethers.utils.getAddress(this.address)
        return `https://pancakeswap.finance/images/tokens/${address}.png`
    }

    public replaceByDefault(e: Event) {
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = BSCToken.bscImg
    }
}
