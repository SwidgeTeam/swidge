import SushiSwapPolygonToken from "./ISushiSwapPolygon";
import IToken from "./IToken";

export default class PolygonToken implements IToken {
    public static polygonImg = 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_64,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/logos/main/token/polygon.jpg';

    address: string;
    symbol: string;
    name: string;
    decimals: number

    constructor(iSushiSwapFantomToken: SushiSwapPolygonToken) {
        this.address = iSushiSwapFantomToken.id
        this.symbol = iSushiSwapFantomToken.symbol
        this.name = iSushiSwapFantomToken.name
        this.decimals = iSushiSwapFantomToken.decimals
    }

    public get img () {
        return `https://res.cloudinary.com/sushi-cdn/image/fetch/w_64,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/polygon/assets/${this.address}/logo.png`
    }

    public replaceByDefault (e: Event) {
        const imageTarget = e.target as HTMLImageElement
        imageTarget.src = PolygonToken.polygonImg
    }
}
