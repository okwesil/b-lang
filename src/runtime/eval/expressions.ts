import { evaluate, toss } from "../interpreter"
import { Create, RuntimeValue, NumberValue, ObjectValue, NativeFunctionValue, StringValue, FunctionValue, ArrayValue, BooleanValue } from "../values"
import { ArrayLiteral, AssignmentExp, BinaryExp, CallExp, Identifier, MemberExp, ObjectLiteral, Operator, SpreadExp, UnaryExp, UnaryOperator } from "../../frontend/ast"
import Environment from "../environment"
import { runFunction } from "./statements"


export function evaluateBinaryExpression(binaryExp: BinaryExp, env: Environment): RuntimeValue {
    // if its a binary expression then recursively call
    let left = evaluate(binaryExp.left, env) as NumberValue 
    let right = evaluate(binaryExp.right, env) as NumberValue 
    const { operator } = binaryExp


    if (left.type != right.type) {
        return Create.null()
    }
    return Create.auto(solve(operator, left.value, right.value))
}

export function evaluateUnaryExpression(unaryExp: UnaryExp, env: Environment) {
    let operator = unaryExp.operator
    let runtimeVal = evaluate(unaryExp.target, env)
    return Create.auto(solveUnary(operator, runtimeVal as BooleanValue | NumberValue))
}

function solveUnary(operator: UnaryOperator, target: BooleanValue | NumberValue) {
    switch(operator) {
        case "not": 
            if (target.type != "boolean") {
                toss("Type Error: \"not\" keyword can only be used on boolean values")
            }
            return !target.value
        case "-":
            if (target.type != "number") {
                toss("Type Error: Cannot negate " + target.type)
            }
            return -target.value 
    }
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
    if (assignment.assignee.type != "Identifier" && assignment.assignee.type != "MemberExp") {
        throw new Error(`Invalid left-hand side assigment:\n ${JSON.stringify(assignment.assignee, null, 2)}`)
    }
    if (assignment.assignee.type == "MemberExp") {
        const memberExp = assignment.assignee as MemberExp
        const object = evaluate(memberExp.object, env) as ObjectValue | ArrayValue

        if (object.type == "array") {
            if (!memberExp.computed) {
                toss("Must provide index in brackets to access array value")
            }

            const index = evaluate(memberExp.property, env)
            if (index.type != "number") {
                toss("Index must be number")
            }
            if (!object.elements[(index as NumberValue).value]) {
                return Create.null()
            }
            switch(assignment.operator) {
                 case "=":
                    object.elements[(index as NumberValue).value] = evaluate(assignment.value, env)
                    break
                case "+=":
                    if (object.elements[(index as NumberValue).value].type != "number" && object.elements[(index as NumberValue).value].type != "string") {
                        toss("Can only perform addition on numbers and strings")
                    }
                    (object.elements[(index as NumberValue).value] as NumberValue | StringValue).value += (evaluate(assignment.value, env) as NumberValue | StringValue).value as any
                    break
                case "-=":
                    if (object.elements[(index as NumberValue).value].type != "number") {
                        toss(`Can only perform ${assignment.operator} on numbers`)
                    }
                    (object.elements[(index as NumberValue).value] as NumberValue).value -= (evaluate(assignment.value, env) as NumberValue).value
                    break   
                case "*=":
                    if (object.elements[(index as NumberValue).value].type != "number") {
                        toss(`Can only perform ${assignment.operator} on numbers`)
                    }
                    (object.elements[(index as NumberValue).value] as NumberValue).value *= (evaluate(assignment.value, env) as NumberValue).value
                    break
                case "/=":
                    if (object.elements[(index as NumberValue).value].type != "number") {
                        toss(`Can only perform ${assignment.operator} on numbers`)
                    }
                    (object.elements[(index as NumberValue).value] as NumberValue).value /= (evaluate(assignment.value, env) as NumberValue).value
                    break
                case "%=":
                    if (object.elements[(index as NumberValue).value].type != "number") {
                        toss(`Can only perform ${assignment.operator} on numbers`)
                    }
                    (object.elements[(index as NumberValue).value] as NumberValue).value %= (evaluate(assignment.value, env) as NumberValue).value
                    break
                case "^=":   
                    if (object.elements[(index as NumberValue).value].type != "number") {
                        toss(`Can only perform ${assignment.operator} on numbers`)
                    }
                    (object.elements[(index as NumberValue).value] as NumberValue).value **= (evaluate(assignment.value, env) as NumberValue).value
                    break
            }
            return object.elements[(index as NumberValue).value]
        }

        // if object
        let key: string;
        if (!memberExp.computed) {
            key = (memberExp.property as Identifier).name
        } else {
            let val = (evaluate(memberExp.property, env) as StringValue)
            if (val.type != "string") {
                toss("Key must be of type string")
            }
            key = val.value
        }

        if (!object.properties.has(key)) {
            return Create.null()
        }

        const prop = object.properties.get(key) as RuntimeValue
        if (prop == undefined) {
            toss("Property does not exist on object")
        }
        
        switch(assignment.operator) {
            case "=":
                object.properties.set(key, evaluate(assignment.value, env))
                break
            case "+=":
                //TODO: check if prop is equal to assignment value for a more detailed check
                if (prop.type != "number" && prop.type != "string") {
                    toss("Can only perform addition on numbers and strings")
                }
                (prop as NumberValue | StringValue).value += (evaluate(assignment.value, env) as NumberValue | StringValue).value as any
                break
            case "-=":
                if (prop.type != "number") {
                    toss(`Can only perform "${assignment.operator}" on numbers`)
                }
                (prop as NumberValue).value -= (evaluate(assignment.value, env) as NumberValue).value
                break
            case "*=":
                if (prop.type != "number") {
                    toss(`Can only perform "${assignment.operator}" on numbers`)
                }
                (prop as NumberValue).value *= (evaluate(assignment.value, env) as NumberValue).value
                break
            case "/=":
                if (prop.type != "number") {
                    toss(`Can only perform "${assignment.operator}" on numbers`)
                }
                (prop as NumberValue).value /= (evaluate(assignment.value, env) as NumberValue).value
                break
            case "%=":
                if (prop.type != "number") {
                    toss(`Can only perform "${assignment.operator}" on numbers`)
                }
                (prop as NumberValue).value %= (evaluate(assignment.value, env) as NumberValue).value
                break
            case "^=":
                if (prop.type != "number") {
                    toss(`Can only perform "${assignment.operator}" on numbers`)
                }
                (prop as NumberValue).value **= (evaluate(assignment.value, env) as NumberValue).value
                break
        }

        return prop as RuntimeValue
        
    }
    const name: string = (assignment.assignee as Identifier).name
    switch(assignment.operator) {
            case "=":
                return env.assignVariable(name, evaluate(assignment.value, env))
            case "+=":
                if (env.lookup(name).value.type != "number" && env.lookup(name).value.type != "string") {
                    toss("Can only perform addition on numbers and strings")
                }
            return env.assignVariable(name, { type: env.lookup(name).value.type, value: (env.lookup(name).value as NumberValue).value + (evaluate(assignment.value, env) as NumberValue).value } as NumberValue | StringValue)
            case "-=":
                if (env.lookup(name).value.type != "number") {
                    toss(`Can only perform ${assignment.operator} on numbers`)
                }
                return env.assignVariable(name, { type: "number", value: (env.lookup(name).value as NumberValue).value - (evaluate(assignment.value, env) as NumberValue).value } as NumberValue)
            case "*=":
                if (env.lookup(name).value.type != "number") {
                    toss(`Can only perform ${assignment.operator} on numbers`)
                }
                return env.assignVariable(name, { type: "number", value: (env.lookup(name).value as NumberValue).value * (evaluate(assignment.value, env) as NumberValue).value } as NumberValue)
            case "/=":
                if (env.lookup(name).value.type != "number") {
                    toss(`Can only perform ${assignment.operator} on numbers`)
                }
                return env.assignVariable(name, { type: "number", value: (env.lookup(name).value as NumberValue).value / (evaluate(assignment.value, env) as NumberValue).value } as NumberValue)
            case "%=":
                if (env.lookup(name).value.type != "number") {
                    toss(`Can only perform ${assignment.operator} on numbers`)
                }
                return env.assignVariable(name, { type: "number", value: (env.lookup(name).value as NumberValue).value % (evaluate(assignment.value, env) as NumberValue).value } as NumberValue)
            case "^=":
                if (env.lookup(name).value.type != "number") {
                    toss(`Can only perform ${assignment.operator} on numbers`)
                }
                return env.assignVariable(name, { type: "number", value: (env.lookup(name).value as NumberValue).value ** (evaluate(assignment.value, env) as NumberValue).value } as NumberValue)
            
    }
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

export function evaluateArrayExpression(array: ArrayLiteral | SpreadExp, env: Environment): ArrayValue {
    if (array.type == "SpreadExp") {
        let val = evaluate(array.argument, env)
        if (val.type != "array") {
            toss("Cannot spread non-array")
        }
        return { type: "array", elements: (val as ArrayValue).elements.map(val => {
            return {...val}
        }) }
    }
    let elements = array.elements.map(element => evaluate(element, env))
    return { type: "array", elements }
}