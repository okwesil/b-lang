import { Create, RuntimeValue, NullValue, FunctionValue } from "../values"
import {  VariableDeclaration, Program, FunctionDeclaration, ReturnStatement  } from "../../frontend/ast"
import { evaluate } from "../interpreter"
import Environment from "../environment"

export function evaluateVariableDeclaration(declaration: VariableDeclaration, env: Environment): NullValue {
    env.declareVariable(declaration.identifier, declaration.value ? evaluate(declaration.value, env): Create.null(), declaration.constant)
    return Create.null()
}

export function evaluateProgram(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = Create.null()
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env)
    }
    return lastEvaluated
}

export function evaluateFunctionDeclaration(fn: FunctionDeclaration, env: Environment): RuntimeValue {
    env.declareVariable(fn.name.name, { type: "ud-function", name: fn.name.name, body: fn.body, params: fn.params} as FunctionValue, true)
    return Create.null()
}

export function evaluateReturnStatement(statement: ReturnStatement, env: Environment): RuntimeValue {
    return evaluate(statement.value, env)
}

export function runFunction(fn: FunctionValue, parent: Environment): RuntimeValue {
    let localScope = new Environment(parent)
    let returnValue
    for (const statement of fn.body) {
        if (statement.type == "ReturnStatement") {
            returnValue = evaluate(statement, localScope)
            break
        }
        evaluate(statement, localScope)
    }
    return returnValue ? returnValue : Create.null()
}