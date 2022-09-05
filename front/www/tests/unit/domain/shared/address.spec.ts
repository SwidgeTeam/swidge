import Address from '@/domain/shared/address'

describe('address', function () {
    it('should format correctly short format', function () {
        const address = new Address('0xaF6C86f07d2A5e08f2f959bcFB69B0690E8b4b36')
        expect(address.shortFormat()).toEqual('0xaF6C...4b36')
    })
    it('should format correctly extra short format', function () {
        const address = new Address('0xaF6C86f07d2A5e08f2f959bcFB69B0690E8b4b36')
        expect(address.extraShortFormat()).toEqual('0xaF6C...')
    })
})
