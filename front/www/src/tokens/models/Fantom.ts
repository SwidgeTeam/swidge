import IToken from './IToken'
import ITokenJson from '@/tokens/models/ITokenJson'

export default class FantomToken implements IToken {

    public static fantomImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_48,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/fantom.jpg'
    address: string
    symbol: string
    name: string
    decimals: number

    constructor(iSushiSwapFantomToken: ITokenJson) {
        this.address = iSushiSwapFantomToken.id
        this.symbol = iSushiSwapFantomToken.symbol
        this.name = iSushiSwapFantomToken.name
        this.decimals = iSushiSwapFantomToken.decimals
    }

    public get img () {
        return `https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/logos/main/token/${this.symbol.toLocaleLowerCase()}.jpg`
    }

    public replaceByDefault (e: Event) {
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = FantomToken.fantomImg
    }
}
