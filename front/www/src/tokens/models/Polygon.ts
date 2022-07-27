import IToken from './IToken'
import ITokenJson from '@/tokens/models/ITokenJson'

export default class PolygonToken implements IToken {
    public static polygonImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_64,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/logos/main/token/polygon.jpg'

    address: string
    symbol: string
    name: string
    decimals: number
    logo: string

    constructor(iSushiSwapFantomToken: ITokenJson) {
        this.address = iSushiSwapFantomToken.id
        this.symbol = iSushiSwapFantomToken.symbol
        this.name = iSushiSwapFantomToken.name
        this.decimals = iSushiSwapFantomToken.decimals
        this.logo = iSushiSwapFantomToken.logo
    }

    public get img() {
        return this.logo
    }

    public replaceByDefault(e: Event) {
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = PolygonToken.polygonImg
    }
}
