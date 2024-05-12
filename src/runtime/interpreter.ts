import { RuntimeValue, NumberValue, Create, NullValue } from "./values";
import { BinaryExp, NumberLiteral, Statement, Operator, Program, isExpression, Identifier, VariableDeclaration, Expression} from "../frontend/ast";
import Environment from "./environment";
import { olog } from "../index"
import { evaluateVariableDeclaration, evaluateProgram } from "./eval/statements";
import { evaluateBinaryExpression, evaluateIdentifier } from "./eval/expression";

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
    switch(astNode.type) {
        // expression
        case "NumberLiteral":
            return Create.number((astNode as NumberLiteral).value)
        case "Identifier":
           return evaluateIdentifier(astNode as Identifier, env)
        case "BinaryExp":
            return evaluateBinaryExpression(astNode as BinaryExp, env)

        // statements 

        case "VariableDeclaration":
            return evaluateVariableDeclaration(astNode as VariableDeclaration, env)
        case "Program":
            return evaluateProgram(astNode as Program, env)
        default:
            console.error("AST Node not setup: ")
            olog(astNode)
            process.exit()
    }
}

