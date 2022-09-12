import { BigNumber } from 'ethers';

export class TokensMother {
    public static fantomWFTM() {
        return {
            chainId: '250',
            chainName: '',
            address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
            name: 'Wrapped Fantom',
            symbol: 'WFTM',
            decimals: 18,
            logo: 'https://api.rango.exchange/i/dDI50C',
            price: '0.5',
            balance: BigNumber.from(0),
        }
    }

    public static polygonMATIC() {
        return {
            chainId: '137',
            chainName: '',
            address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            name: 'Matic',
            symbol: 'MATIC',
            decimals: 18,
            logo: 'https://api.rango.exchange/i/dDI50C',
            price: '0.5',
            balance: BigNumber.from(0),
        }
    }

    public static list() {
        return {
            '137': [
                this.polygonMATIC(),
            ],
            '250': [
                this.fantomWFTM(),
            ]
        }
    }
}
