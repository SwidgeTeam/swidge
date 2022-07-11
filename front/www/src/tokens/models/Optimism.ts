import IToken from './IToken'
import ITokenJson from '@/tokens/models/ITokenJson'

export default class OptimismToken implements IToken {

    public static fantomImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_64,q_auto/https://raw.githubusercontent.com/sushiswap/list/master/logos/network-logos/optimism.jpg'
    address: string
    symbol: string
    name: string
    decimals: number
    logo: string

    constructor(json: ITokenJson & { logo: string }) {
        this.address = json.id
        this.symbol = json.symbol
        this.name = json.name
        this.decimals = json.decimals
        this.logo = json.logo
    }

    public get img() {
        return this.logo
    }

    public replaceByDefault(e: Event) {
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = OptimismToken.fantomImg
    }
}