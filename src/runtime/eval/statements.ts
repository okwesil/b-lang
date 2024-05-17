import { Create, RuntimeValue, NullValue, FunctionValue, BooleanValue, ReturnValue } from "../values"
import {  VariableDeclaration, Program, FunctionDeclaration, ReturnStatement, WhileStatement, IfStatement, Expression  } from "../../frontend/ast"
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

export function runFunction(fn: FunctionValue, parent: Environment, args: RuntimeValue[]): RuntimeValue {
    let localScope = new Environment(parent)
    for (let i = 0; i < fn.params.length; i++) {
        localScope.declareVariable(fn.params[i].name, args[i], false)
    }
    let returnValue
    for (const statement of fn.body) {
        if (statement.type == "ReturnStatement") {
            returnValue = evaluate(statement, localScope)
            break
        }
        let val = evaluate(statement, localScope)
        if (val.type == "return-value") {
            returnValue = (val as ReturnValue).value
            break
        }
    }
    return returnValue ? returnValue : Create.null()
}

export function evaluateWhileStatment(statement: WhileStatement, env: Environment): RuntimeValue {
    let returnValue: ReturnValue = {
        type: "return-value",
        value: undefined
    }
    conditionLoop: while ((evaluate(statement.condition, env) as BooleanValue).value == true) {
        for (const stmt of statement.body) {
            if (stmt.type == "ReturnStatement") {
                returnValue.value = evaluate((stmt as ReturnStatement).value, env)
                break conditionLoop
            }
            let val = evaluate(stmt, env)
            if (val.type == "return-value") {
                returnValue.value = val
                break conditionLoop
            }
        }
    }
    return returnValue.value ? returnValue.value : Create.null()
}

export function evaluateIfStatment(statement: IfStatement, env: Environment): ReturnValue | NullValue  {
    let returnValue: ReturnValue = {
        type: "return-value",
        value: undefined
    }
    if ((evaluate(statement.condition, env) as BooleanValue).value == true) {
        for (const stmt of statement.body) {
            if (stmt.type == "ReturnStatement") {
                returnValue.value = evaluate((stmt as ReturnStatement).value, env)
                break
            }
            let val = evaluate(stmt, env)
            if (val.type == "return-value") {
                returnValue.value = val
                break
            }
        }
    }
    return returnValue.value ? returnValue : Create.null()
}