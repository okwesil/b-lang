#!/usr/bin/env node
import Parser from "./frontend/parser"
import { evaluate } from "./runtime/interpreter"
import readline from "readline/promises"
// basically just a scope
import { Program } from "./frontend/ast"
import { readFileSync } from "fs"
import { createGlobalScope } from "./runtime/environment"
import { program } from "commander"

const env = createGlobalScope()

program
    .argument("[file]", "file to execute")
    .action(file => {
        if (file) {
            evaluate(run(file), env)
        } else {
            repl()
        }
    })
program.parse()



async function ask(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    let answer = await rl.question(prompt) 
    rl.close()
    return answer
}

function run(filepath: string): Program {
    const sourceCode = readFileSync(filepath, { encoding: "utf8" })
    return new Parser().makeAST(sourceCode)
} 

async function repl(): Promise<void> {
    const parser = new Parser();
    console.log("B-Lang Repl v0.2.3")
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
        console.log("\n")
        console.log(evaluate(program, env))
        console.log("-------------\n")
    }
}

export function olog(object: Object) {
    console.log(JSON.stringify(object, null, 2))
}
