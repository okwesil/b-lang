import { evaluate } from "../interpreter"
import { Create, NullValue, RuntimeValue, NumberValue } from "../values"
import { BinaryExp, Expression, Identifier, Operator } from "../../frontend/ast"
import Environment from "../environment"


export function evaluateBinaryExpression(binaryOp: BinaryExp, env: Environment): RuntimeValue {
    // if its a binary expression then recursively call
    let left = evaluate(binaryOp.left, env) as NumberValue 
    let right = evaluate(binaryOp.right, env) as NumberValue 
    const { operator } = binaryOp

    // if any are not number then 
    if (left.type != "number" || right.type != "number") {
        return Create.null()
    }

    return Create.number(solve(operator, left.value, right.value))
}

 

export function evaluateIdentifier(ident: Identifier, env: Environment): RuntimeValue {
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
