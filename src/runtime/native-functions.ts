import Environment from "./environment";
import { toss } from "./interpreter";
import { ArrayValue, BooleanValue, Create, FunctionCall, NumberValue, ObjectValue, ReturnValue, RuntimeValue, StringValue } from "./values";

export const inspect: FunctionCall = (args, env) => {
    console.log(...args)
    return Create.null()
}

export const copy: FunctionCall = (args, env) => {
    if (args[0].type != "array") {
        toss("copy: Argument must be an array")
    }

    let elements: RuntimeValue[] = []
    for (const element of (args[0] as ArrayValue).elements) {
        elements.push({...element})
    }
    return { type: "array", elements } as ArrayValue
}

export const println: FunctionCall = (args, env) => {
    let str: string = ""
    for (const arg of args) {
        str += represent(arg) + " "
    }
    console.log(str)
    return Create.null()
}


function represent(val: RuntimeValue): string {
    switch(val.type) {
        case "string":
            return (val as StringValue).value
        case "number":
            return (val as NumberValue).value.toString()
        case "boolean":
            return (val as BooleanValue).value.toString()
        case "object":
            let str = "{"
            for (const [key, value] of (val as ObjectValue).properties) {
                str += ` ${key}: ${represent(value)},`
            }
            str = str.substring(0, str.length - 1) // remove last element comma
            str += " }"
            return str
        case "null":
            return "null"
        case "native-function":
            return "Native Function()"
        case "ud-function":
            return "Function()"
        case "return-value":
            return `Return Value: ${(val as ReturnValue).value}`
        case "array":
            let _str = "["
            for (const element of (val as ArrayValue).elements) {
                _str += ` ${represent(element)},`
            }

            _str = _str.substring(0, _str.length - 1) // remove last element comma

            _str += " ]"
            return _str
    }
}

export const print: FunctionCall = (args, env) => {
    let str: string = ""
    for (const arg of args) {
        str += represent(arg) + " "
    }
    str = str.substring(0, str.length - 1) // remove last space
    process.stdout.write(str)
    return Create.null()
}

export const len: FunctionCall = (args, env) => {
    let length;
    switch(args[0].type) {
        case "string":
            length = (args[0] as StringValue).value.length
        case "number":
            length = (args[0] as NumberValue).value.toString().length
        case "boolean":
            toss("Boolean values do not have a length")
        case "object":
            length = (args[0] as ObjectValue).properties.size
        case "null":
            toss("null does not have a length")
        case "native-function":
            toss("functions don't have a length")
        case "ud-function":
            toss("functions don't have a length")
        case "return-value":
            toss("Return values do not have a length")
        case "array":
            length = (args[0] as ArrayValue).elements.length
    }
    return Create.number(length)
} 

export const math: Record<string, FunctionCall> = {
    "pow": (args, env) => {
        if (args.length < 2) {
            toss("Math.pow: Must have 2 arguments")
        }
        if (args[0].type != "number" || args[1].type != "number") {
            toss("Math.pow: Both argument must be a number")
        }
        
        return Create.number(Math.pow((args[0] as NumberValue).value,  (args[1] as NumberValue).value))
    },
    "abs": (args, env) => {
        if (args.length < 1) {
            toss("Math.abs: Must have 2 arguments")
        }
        if (args[0].type != "number") {
            toss("Math.abs: Argument must be a number")
        }
        return Create.number(Math.abs((args[0] as NumberValue).value))
    },
    "max": (args, env) => {
        if (args.some(arg => arg.type != "number")) {
            toss("Math.max: all argument must be numbers")
        }
        return Create.number(Math.max(...args.map(arg => (arg as NumberValue).value)))
    },
    "min": (args, env) => {
        if (args.some(arg => arg.type != "number")) {
            toss("Math.min: all arguments must be numbers")
        }
        return Create.number(Math.min(...args.map(arg => (arg as NumberValue).value)))
    },
    "floor": (args, env) => {
        if (args.some(arg => arg.type != "number")) {
            toss("Math.round: argument must be a number")
        }
        return Create.number(Math.floor((args[0] as NumberValue).value))
    },
    "random": (args, env) => {
        return Create.number(Math.random())
    },
    "sin": (args, env) => {
        if (args[0].type != "number") {
            toss("Math.sin: Argument must be a number")
        }
        return Create.number(Math.sin((args[0] as NumberValue).value))
    },
    "cos": (args, env) => {
        if (args[0].type != "number") {
            toss("Math.cos: Argument must be a number")
        }
        return Create.number(Math.cos((args[0] as NumberValue).value))
    },
    "tan": (args, env) => {
        if (args[0].type != "number") {
            toss("Math.tan: Argument must be a number")
        }
        return Create.number(Math.tan((args[0] as NumberValue).value))
    },
    "sqrt": (args, env) => {
        if (args[0].type != "number") {
            toss("Math.sqrt: Argument must be a number")
        }
        return Create.number(Math.sqrt((args[0] as NumberValue).value))
    }
}