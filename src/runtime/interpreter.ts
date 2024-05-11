import { RuntimeValue, NumberValue, NullValue } from "./values";
import { BinaryExp, NumberLiteral, Statement, Operator, Program, isExpression, Identifier} from "../main/ast";
import Environment from "./environment";
import { olog } from "../index"


function evaluateBinaryExpression(binaryOp: BinaryExp, env: Environment): RuntimeValue {
    // if its a binary expression then recursively call
    let left = evaluate(binaryOp.left, env)  as NumberValue  | NullValue
    let right = evaluate(binaryOp.right, env) as NumberValue | NullValue

    // if any are not number then 
    if (left.type != "number" || right.type != "number") {
        return { type: "null", value: "null" } as NullValue
    }

    return { type: "number", value: solve(binaryOp.operator, left.value, right.value) } as NumberValue
}

function evaluateProgram(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = { type: "null", value: "null" } as NullValue
    for (const statement of program.body) {
        if (isExpression(statement)) {
            lastEvaluated = evaluate(statement, env)
        }
    }
    return lastEvaluated
} 


function solve(operator: Operator, left: number, right: number): number {
    switch(operator) {
        case "+":
            return left + right
        case "-":
            return left - right
        case "*":
            return left * right
        case "/":
            return left / right  
        case "%":
            return left % right   
        case "^":
            return left ** right   
    }
}


export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
    switch(astNode.type) {
        case "NumberLiteral":
            return {
                type: "number",
                value: ((astNode as NumberLiteral).value)
            } as NumberValue 


        case "NullLiteral":
            return  {
                type: "null",
                value: "null"
            } as NullValue
        case "Identifier":
            let variable = env.lookup((astNode as Identifier).name)
            return {
                type: "number",
                value: (variable as NumberValue).value
            } as NumberValue
        case "BinaryExp":
            return evaluateBinaryExpression(astNode as BinaryExp, env)
        case "Program":
            return evaluateProgram(astNode as Program, env)
        default:
            console.error("AST Node not setup: ")
            olog(astNode)
            process.exit()
    }
}
