export default class AmountFormatter {
    public static format(amount: string, decimals?: number): string {
        const value = Number(amount)
        if (!decimals) {
            if (value < 1) {
                decimals = 6
            } else if (value > 1000000) {
                decimals = 0
            } else {
                decimals = 2
            }
        }
        return AmountFormatter.commaSeparateNumber(value.toFixed(decimals))
    }

    private static commaSeparateNumber(amount: string): string {
        let val = Number(amount)
        // remove sign if negative
        let sign = 1
        if (val < 0) {
            sign = -1
            val = -val
        }

        // trim the number decimal point if it exists
        let num = val.toString().includes('.') ? val.toString().split('.')[0] : val.toString()

        while (/(\d+)(\d{3})/.test(num.toString())) {
            // insert comma to 4th last position to the match number
            num = num.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2')
        }

        // add number after decimal point
        if (val.toString().includes('.')) {
            num = num + '.' + val.toString().split('.')[1]
        }

        // return result with - sign if negative
        return sign < 0 ? '-' + num : num
    }
}
