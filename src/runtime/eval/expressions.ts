import { evaluate } from "../interpreter"
import { Create, RuntimeValue, NumberValue, ObjectValue, NativeFunctionValue } from "../values"
import { AssignmentExp, BinaryExp, CallExp, Identifier, ObjectLiteral, Operator } from "../../frontend/ast"
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
    let variable = env.lookup((ident as Identifier).name).value 
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


export function evaluateAssignment(assignment: AssignmentExp, env: Environment): RuntimeValue {
    if (assignment.assignee.type != "Identifier") {
        throw new Error(`Invalid left-hand side assigment:\n ${JSON.stringify(assignment.assignee, null, 2)}`)
    }
    return env.assignVariable((assignment.assignee as Identifier).name, evaluate(assignment.value, env))
}

export function evaluateObjectExpression(literal: ObjectLiteral, env: Environment): RuntimeValue {
    const object: ObjectValue = {
        type: "object",
        properties: new Map()
    }
    for (const prop of literal.properties) {
        const runtimeValue = !prop.value ? env.lookup(prop.key).value: evaluate(prop.value, env)        

        object.properties.set(prop.key, runtimeValue)
    }
    return object
}

export function evaluateCallExpression(expression: CallExp, env: Environment): RuntimeValue {
    const args = expression.args.map(arg => evaluate(arg, env))
    const fn = evaluate(expression.caller, env)

    if (fn.type != "native-function") {
        throw new Error("Cannot call non native function:\n" + JSON.stringify(fn, null, 2))
    }

    let result = (fn as NativeFunctionValue).call(args, env)

    return result
}