import { RuntimeValue, Create } from "./values";
import { BinaryExp, NumberLiteral, Statement, Program, Identifier, VariableDeclaration, AssignmentExp, ObjectLiteral, CallExp, StringLiteral, MemberExp, FunctionDeclaration, ReturnStatement} from "../frontend/ast";
import Environment from "./environment";
import { evaluateVariableDeclaration, evaluateProgram, evaluateFunctionDeclaration, evaluateReturnStatement } from "./eval/statements";
import { evaluateAssignment, evaluateBinaryExpression, evaluateCallExpression, evaluateIdentifier, evaluateMemberExpression, evaluateObjectExpression } from "./eval/expressions";

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
    switch(astNode.type) {
        // expression
        case "NumberLiteral":
            return Create.number((astNode as NumberLiteral).value)
        case "StringLiteral":
            return Create.string((astNode as StringLiteral).value)
        case "Identifier":
           return evaluateIdentifier(astNode as Identifier, env)
        case "ObjectLiteral":
            return evaluateObjectExpression(astNode as ObjectLiteral, env)
        case "BinaryExp":
            return evaluateBinaryExpression(astNode as BinaryExp, env)
        case "AssignmentExp":
            return evaluateAssignment(astNode as AssignmentExp, env)
        case "CallExp":
            return evaluateCallExpression(astNode as CallExp, env)
        case "MemberExp":
            return evaluateMemberExpression(astNode as MemberExp, env)

        // statements 
        case "VariableDeclaration":
            return evaluateVariableDeclaration(astNode as VariableDeclaration, env)
        case "Program":
            return evaluateProgram(astNode as Program, env)
        case "FunctionDeclaration":
            return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env)
        case "ReturnStatement":
            return evaluateReturnStatement(astNode as ReturnStatement, env)
        default:
            console.error("AST Node not setup: ")
            console.log(JSON.stringify(astNode, null, 2))
            process.exit()
    }
}
export function toss(error: string, code?: number, line? : number, col?: number ) {
    console.error(error)
    if (line && col) {
        console.error(`In ${line}:${col}`)
    }
    if (code) {
        process.exitCode = code
    }
    process.exit()
}