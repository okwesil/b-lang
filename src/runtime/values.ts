export type ValueType = "null" | "number"

export interface RuntimeValue {
    type: ValueType
}

export interface NullValue extends RuntimeValue{
    type: "null"
    value: "null"
}


export interface NumberValue extends RuntimeValue {
    type: "number"
    value: number
}

export class Create {
    static number(value: number): NumberValue {
        return { type: "number", value }
    }
    static null(): NullValue {
        return { type: "null", value: "null" }
    }
}