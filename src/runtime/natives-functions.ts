import { Expression } from "../frontend/ast";
import Environment from "./environment";
import { toss } from "./interpreter";
import { Create, FunctionCall, NullValue, NumberValue, RuntimeValue } from "./values";

export const pow: FunctionCall = (args, env) => {
    if (args.length != 2) {
        toss("pow: Must have 2 arguments")
    }
    if (args[0].type != "number" || args[1].type != "number") {
        toss("pow: Both argument must be a number")
    }
    
    return Create.number(Math.pow((args[0] as NumberValue).value,  (args[1] as NumberValue).value))
}
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