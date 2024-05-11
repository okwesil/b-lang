import { RuntimeValue, NumberValue, NullValue, Create } from "./values";
import { BinaryExp, NumberLiteral, Statement, Operator, Program, isExpression, Identifier} from "../main/ast";
import Environment from "./environment";
import { olog } from "../index"


function evaluateBinaryExpression(binaryOp: BinaryExp, env: Environment): RuntimeValue {
    // if its a binary expression then recursively call
    let left = evaluate(binaryOp.left, env)  as NumberValue 
    let right = evaluate(binaryOp.right, env) as NumberValue 
    const { operator } = binaryOp

    // if any are not number then 
    if (left.type != "number" || right.type != "number") {
        return Create.null()
    }

    return Create.number(solve(operator, left.value, right.value))
}

function evaluateProgram(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = Create.null()
    for (const statement of program.body) {
        if (isExpression(statement)) {
            lastEvaluated = evaluate(statement, env)
        }
    }
    return lastEvaluated
} 

function evaluateIdentifier(ident: Identifier, env: Environment): RuntimeValue {
    let variable = env.lookup((ident as Identifier).name) as NumberValue
    return variable
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
            return Create.number((astNode as NumberLiteral).value)
        case "NullLiteral":
            return Create.null()
        case "Identifier":
           return evaluateIdentifier(astNode as Identifier, env)
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

