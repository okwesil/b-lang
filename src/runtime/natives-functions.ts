import Environment from "./environment";
import { toss } from "./interpreter";
import { Create, FunctionCall, NumberValue } from "./values";

export const println: FunctionCall = (args, env) => {
    let str: string = ""
    for (const arg of args) {
        str += " " + (arg as NumberValue).value
    }
    str += "\n"
    process.stdout.write(str)
    return Create.null()
}
export const print: FunctionCall = (args, env) => {
    let str: string = ""
    for (const arg of args) {
        str += " " + (arg as NumberValue).value
    }
    process.stdout.write(str)
    return Create.null()
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
    }
}