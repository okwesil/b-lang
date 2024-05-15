import Environment from "./environment"

export type ValueType = "null" | "number" | "string" | "boolean" | "object" | "native-function"

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

export interface StringValue extends RuntimeValue {
    type: "string"
    value: string
}

export interface BooleanValue extends RuntimeValue {
    type: "boolean",
    value: boolean
}

export interface Variable {
    value: RuntimeValue
    constant: boolean
}

export interface ObjectValue extends RuntimeValue {
    type: "object"
    properties: Map<string, RuntimeValue>
}

export interface NativeFunctionValue extends RuntimeValue {
    type: "native-function"
    call: FunctionCall
}

export type FunctionCall = ( args: RuntimeValue[], env: Environment ) => RuntimeValue

export class Create {
    static number(value: number): NumberValue {
        return { type: "number", value }
    }
    static string(value: string): StringValue {
        return { type: "string", value }
    }
    static null(): NullValue {
        return { type: "null", value: "null" }
    }
    static bool(value: boolean): BooleanValue {
        return { type: "boolean", value }
    }
    static var(value: RuntimeValue, constant: boolean): Variable {
        return { value, constant }
    }
    static nativeFn(call: FunctionCall): NativeFunctionValue {
        return { type: "native-function", call } 
    }
}