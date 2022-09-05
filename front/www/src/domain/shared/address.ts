export default class Address {
    constructor(private readonly address: string) {}

    public shortFormat(): string {
        return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4)
    }

    public extraShortFormat(): string {
        return this.address.substring(0, 6) + '...'
    }
}
