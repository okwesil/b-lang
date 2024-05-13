import Environment from "./environment"

export type ValueType = "null" | "number" | "boolean" | "object"

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

export interface Variable {
    value: RuntimeValue
    constant: boolean
}

export interface ObjectValue extends RuntimeValue {
    type: "object"
    properties: Map<string, RuntimeValue>
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
    static var(value: RuntimeValue, constant: boolean): Variable {
        return { value, constant }
    }
    static globalEnv(): Environment {
        const env = new Environment(null)
        env.declareVariable("null", Create.null(), true)
        env.declareVariable("true", Create.bool(true), true)
        env.declareVariable("false", Create.bool(false), true)
        return env
    }
}