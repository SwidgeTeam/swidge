import ITokenJson from '@/tokens/models/ITokenJson'

export default class FantomToken  {

    public static fantomImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_48,q_auto/https://raw.githubusercontent.com/sushiswap/icons/master/network/fantom.jpg'
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
        return this.logo
    }

    public replaceByDefault(e: Event) {
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = FantomToken.fantomImg
    }
}
