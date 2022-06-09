export default interface IToken {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    img: string;
    replaceByDefault: (event: Event) => void;
} 