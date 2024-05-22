import { Identifier, Statement, Type } from "../frontend/ast"
import Environment from "./environment"

export type ValueType = "null" | "number" | "string" | "boolean" | "object" | "native-function" | "function" | "function-exp" | "return-value" | "array"

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

export interface ArrayValue extends RuntimeValue {
    type: "array"
    elements: RuntimeValue[]
}

export interface NativeFunctionValue extends RuntimeValue {
    type: "native-function"
    call: FunctionCall
}

export interface FunctionValue extends RuntimeValue {
    type: "function"
    name: string
    params: Identifier[],
    body: Statement[],
    returnType: Type
}

export interface FunctionExpValue extends RuntimeValue {
    type: "function-exp"
    params: Identifier[],
    body: Statement[]
}
 
export interface ReturnValue extends RuntimeValue {
    type: "return-value"
    value?: RuntimeValue
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
                if (value == null) {
                    return Create.null()
                }
                return Create.object(value)
        }
    }
    static number(value: number): NumberValue {
        return { type: "number", value }
    }
    static string(value: string): StringValue {
        return { type: "string", value }
    }
    static array(arr: (string | number | boolean | FunctionCall | null)[]) {
        let result: RuntimeValue[] = []
        for (const value of arr ) {
            result.push(Create.auto(value))
        }
        return { type: "array", elements: result } as ArrayValue
    }
    static object(value: Record<string, number | string | boolean | null | FunctionCall> | Array<number | string | boolean | null | FunctionCall>): ObjectValue | ArrayValue {
        if (Array.isArray(value)) {
            return Create.array(value)
        }
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