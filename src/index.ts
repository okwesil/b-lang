import Parser from "./main/parser"
import { Program } from "./main/ast"
import { evaluate } from "./runtime/interpreter"
import readline from "readline/promises"
// basically just a scope
import Environment from "./runtime/environment"
import { NumberValue } from "./runtime/values"

const env = new Environment(null)
env.declareVariable("pi", { type: "number", value: Math.PI } as NumberValue)

async function ask(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    let answer = await rl.question(prompt) 
    rl.close()
    return answer
}


async function repl(): Promise<void> {
    const parser = new Parser();
    console.log("B-Lang Repl v0.0.1")
    console.log("--------------\n")
    while (true) {
        const input = await ask("> ")

        if (input == "" || input.includes(".exit")) {
            process.exitCode = 0
            console.log("exiting...")
            process.exit();
        }
        if (input == "clear") {
            console.clear()
            continue
        }

        const program = parser.makeAST(input)
        olog(evaluate(program, env))
        console.log("-------------\n")
    }
}

export function olog(object: Object) {
    console.log(JSON.stringify(object, null, 2))
}

repl()