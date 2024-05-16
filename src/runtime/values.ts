import { Identifier, Statement } from "../frontend/ast"
import Environment from "./environment"

export type ValueType = "null" | "number" | "string" | "boolean" | "object" | "native-function" | "ud-function"

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

export interface FunctionValue extends RuntimeValue {
    type: "ud-function"
    name: string
    params: Identifier[],
    body: Statement[],
}

export type FunctionCall = ( args: RuntimeValue[], env: Environment ) => RuntimeValue

export class Create {
    static auto(value: number | string | boolean | Function | null ): RuntimeValue {
        switch(typeof value) {
            case "string":
                return Create.string(value)
            case "number":
                return Create.number(value)
            case "boolean":
                return Create.bool(value)
            case "function":
                return Create.nativeFn(value as FunctionCall)
            case "object": // TODO: change this to be more definite
                return Create.null()
        }
    }
    static number(value: number): NumberValue {
        return { type: "number", value }
    }
    static string(value: string): StringValue {
        return { type: "string", value }
    }
    static object(value: Record<string, number | string | boolean | null | FunctionCall>): ObjectValue {
        let obj = {
            type: "object",
            properties: new Map()
        } as ObjectValue
        for (const key in value) {
            obj.properties.set(key, Create.auto(value[key]))
        }
        return obj
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