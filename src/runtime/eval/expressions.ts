import { evaluate, toss } from "../interpreter"
import { Create, RuntimeValue, NumberValue, ObjectValue, NativeFunctionValue, StringValue, FunctionValue, ArrayValue } from "../values"
import { ArrayLiteral, AssignmentExp, BinaryExp, CallExp, Identifier, MemberExp, ObjectLiteral, Operator } from "../../frontend/ast"
import Environment from "../environment"
import { runFunction } from "./statements"


export function evaluateBinaryExpression(binaryOp: BinaryExp, env: Environment): RuntimeValue {
    // if its a binary expression then recursively call
    let left = evaluate(binaryOp.left, env) as NumberValue 
    let right = evaluate(binaryOp.right, env) as NumberValue 
    const { operator } = binaryOp


    if (left.type != right.type) {
        return Create.null()
    }
    return Create.auto(solve(operator, left.value, right.value))
}

 

export function evaluateIdentifier(ident: Identifier, env: Environment): RuntimeValue {
    let variable = env.lookup((ident as Identifier).name).value 
    return variable
}


function solve(operator: Operator, left: any, right: any): number | string | boolean {
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
        case "<":
            return left < right
        case ">":
            return left > right
        case "==":
            return left == right
        case "!=":
            return left != right
        case "<=":
            return left <= right
        case ">=":
            return left >= right
        case "and":
            return left && right
        case "or":
            return left || right
    }
}


export function evaluateAssignment(assignment: AssignmentExp, env: Environment): RuntimeValue {
    if (assignment.assignee.type != "Identifier") {
        throw new Error(`Invalid left-hand side assigment:\n ${JSON.stringify(assignment.assignee, null, 2)}`)
    }
    return env.assignVariable((assignment.assignee as Identifier).name, evaluate(assignment.value, env))
}

export function evaluateObjectExpression(literal: ObjectLiteral, env: Environment): ObjectValue {
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

export function evaluateMemberExpression(member: MemberExp, env: Environment): RuntimeValue {
    let object = evaluate(member.object, env) as ObjectValue
    if  (object.type != "object" && object.type != "array") {
        toss("object in member expression must be an object") 
    } 
    if (!member.computed) {
        let value = member.property as Identifier
        if (!object.properties.has(value.name)) {
            toss("Object does not have property: " + value.name)
        }
        return object.properties.get(value.name) as RuntimeValue
    }
    // if reached here that means member is computed
    // object["hoo"]
    // also means object referring to could be an array
    let value = evaluate(member.property, env) as StringValue | NumberValue
    if (value.type == "string") {
        if (!object.properties.has(value.value)) {
            return Create.null()
        }
        return object.properties.get(value.value) as RuntimeValue
    } 
    if (value.type != "number") {
        toss("Value in member expression must be number or string")
    }
    let array = object as unknown as ArrayValue
    if (array.elements.at(value.value)) {
        return array.elements.at(value.value) as RuntimeValue
    }
    return Create.null()
}

export function evaluateCallExpression(expression: CallExp, env: Environment): RuntimeValue {
    const args = expression.args.map(arg => evaluate(arg, env))
    const fn = evaluate(expression.caller, env)

    if (fn.type != "native-function") {
        return runFunction((fn as FunctionValue), env, args)
    }

    let result = (fn as NativeFunctionValue).call(args, env)

    return result
}

export function evaluateArrayExpression(array: ArrayLiteral, env: Environment): ArrayValue {
    let elements = array.elements.map(element => evaluate(element, env))
    return { type: "array", elements }
}