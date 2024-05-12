import { Create, RuntimeValue, NullValue } from "../values"
import { isExpression, VariableDeclaration, Program, Expression } from "../../frontend/ast"
import { evaluate } from "../interpreter"
import Environment from "../environment"

export function evaluateVariableDeclaration(declaration: VariableDeclaration, env: Environment): NullValue {
    env.declareVariable(declaration.identifier, declaration.value ? evaluate(declaration.value, env): Create.null(), declaration.constant)
    return Create.null()
}

export function evaluateProgram(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = Create.null()
    for (const statement of program.body) {
        if (isExpression(statement)) {
            lastEvaluated = evaluate(statement, env)
        }
    }
    return lastEvaluated
}