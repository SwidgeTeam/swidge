import ITokenJson from '@/tokens/models/ITokenJson'

export default class PolygonToken {
    public static polygonImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_64,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/logos/main/token/polygon.jpg'

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
        imageTarget.src = PolygonToken.polygonImg
    }
}
