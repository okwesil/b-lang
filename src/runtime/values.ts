export type ValueType = "null" | "number" | "boolean"

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

export interface BooleanValue extends RuntimeValue {
    type: "boolean",
    value: boolean
}

export class Create {
    static number(value: number): NumberValue {
        return { type: "number", value }
    }
    static null(): NullValue {
        return { type: "null", value: "null" }
    }
    static bool(value: boolean): BooleanValue {
        return { type: "boolean", value }
    }
}