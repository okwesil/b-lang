import { RuntimeValue, Create } from "./values";
import { BinaryExp, NumberLiteral, Statement, Program, Identifier, VariableDeclaration, AssignmentExp} from "../frontend/ast";
import Environment from "./environment";
import { olog } from "../index"
import { evaluateVariableDeclaration, evaluateProgram } from "./eval/statements";
import { evaluateAssignment, evaluateBinaryExpression, evaluateIdentifier } from "./eval/expressions";

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
    switch(astNode.type) {
        // expression
        case "NumberLiteral":
            return Create.number((astNode as NumberLiteral).value)
        case "Identifier":
           return evaluateIdentifier(astNode as Identifier, env)
        case "BinaryExp":
            return evaluateBinaryExpression(astNode as BinaryExp, env)
        case "AssignmentExp":
            return evaluateAssignment(astNode as AssignmentExp, env)

        // statements 

        case "VariableDeclaration":
            return evaluateVariableDeclaration(astNode as VariableDeclaration, env)
        case "Program":
            return evaluateProgram(astNode as Program, env)
        default:
            console.error("AST Node not setup: ")
            console.log(JSON.stringify(astNode, null, 2))
            process.exit()
    }
}

