export interface ISwidgeStateMachineStep {
    title: string
    subTitle: string,
    completed: boolean
}

// CrossInitiated in the origin chain is done 
export class SwidgeStateMachineStepOne implements ISwidgeStateMachineStep {
    // I have already this data before starting the swap, condiderating the we will use just one stable coin , let's say USDC
    private _sourceTokenName: string
    private _sourceTokenAmount: number
    private _stableCoinName: string
    // This data are coming from CrossInitiated
    private _stableCoinAmount: number
    private _completed: boolean

    constructor(sourceTokenName: string, sourceTokenAmount: number, stableCoinName: string, stableCoinAmount: number, completed = false) {
        this._sourceTokenName = sourceTokenName
        this._sourceTokenAmount = sourceTokenAmount
        this._stableCoinName = stableCoinName
        this._stableCoinAmount = stableCoinAmount
        this._completed = completed
    }

    public get title(): string {
        return 'Swap on Ox'
    }

    public get subTitle(): string {
        return `${this._sourceTokenAmount.toString()} ${this._sourceTokenName} -> ${this._stableCoinAmount.toString()} ${this._stableCoinName}`
    }

    public get stableCoinName(): string {
        return this._stableCoinName
    }

    public get stableCoinAmount(): number {
        return this._stableCoinAmount
    }

    public get completed(): boolean {
        return this._completed
    }
}

export class SwidgeStateMachineStepTwo implements ISwidgeStateMachineStep {
    private _sourceChainName: string
    private _destinationChainName: string
    private _stableCoinDestinationAmount: number
    private _stepOne: SwidgeStateMachineStepOne
    private _completed: boolean

    constructor(stepOne: SwidgeStateMachineStepOne, sourceChainName: string, destinationChainName: string, stableCoinDestinationAmount: number, completed = false) {
        this._sourceChainName = sourceChainName
        this._destinationChainName = destinationChainName
        this._stableCoinDestinationAmount = stableCoinDestinationAmount
        this._stepOne = stepOne
        this._completed = completed
    }

    public get title(): string {
        return `Transfer from ${this._sourceChainName} to ${this._destinationChainName} via Ox`
    }

    public get subTitle(): string {
        return `${this._stepOne.stableCoinAmount.toString()} ${this._stepOne.stableCoinName} -> ${this._stableCoinDestinationAmount.toString()} ${this._stepOne.stableCoinName}`
    }

    public get completed(): boolean {
        return this._completed
    }
}

export class SwidgeStateMachineStepThree implements ISwidgeStateMachineStep {
    private _stableCoinName: string
    private _stableCoinAmount: number
    private _destinationTokenName: string
    private _destinationTokenAmount: number
    private _completed: boolean
    

    constructor(destinationTokenName: string, destinationTokenAmount: number, stableCoinName: string, stableCoinAmount: number, completed = false) {
        this._destinationTokenName = destinationTokenName
        this._destinationTokenAmount = destinationTokenAmount
        this._stableCoinName = stableCoinName
        this._stableCoinAmount = stableCoinAmount
        this._completed = completed
    }

    public get title(): string {
        return 'Swap on Ox'
    }

    public get subTitle(): string {
        return `${this._stableCoinAmount.toString()} ${this._stableCoinName} -> ${this._destinationTokenAmount.toString()} ${this._destinationTokenName}`
    }

    public get completed(): boolean {
        return this._completed
    }
}

export default class SwidgeStateMachine {
    private _stepState: ISwidgeStateMachineStep
    private _steps: ISwidgeStateMachineStep[]

    constructor() {
        this._stepState = new SwidgeStateMachineStepOne('ETH', 1, 'USDT', 3227.14)
        this._steps = [new SwidgeStateMachineStepOne('ETH', 1, 'USDT', 3227.14)]
    }

    public get state() {
        return this._stepState
    }

    public get steps() {
        return this._steps
    }
}