import { RuntimeValue } from "../runtime/values"

export type NodeType = 
    "Program" 
    | "NumberLiteral" 
    | "Identifier" 
    | "BinaryExp" 
    | "VariableDeclaration"
    | "VariableAssignment";


export type Operator = "+" | "-" | "*" | "/" | "%" | "^"


// statement doen't inherently return a value
export interface Statement {
    type: NodeType
}


// "value" property can be undefined like if we do:
// Let x;
export interface VariableDeclaration extends Statement {
    type: "VariableDeclaration"
    constant: boolean
    identifier: string
    value?: Expression
}

export interface VariableAssignment extends Statement {
    type: "VariableAssignment"
    identifier: string
    value: Expression
}


// expression do return a value
// no distinction yet because we have no statements
export interface Expression extends Statement {}
export interface BinaryExp extends Expression {
    type: "BinaryExp",
    left: Expression,
    right: Expression,
    operator: Operator
}


export interface Identifier extends Expression {
    type: "Identifier",
    name: string
}

export interface NumberLiteral extends Expression {
    type: "NumberLiteral",
    value: number
}


export interface Program extends Statement {
    type: "Program"
    body: Statement[]
}

export function isExpression(statement: Statement): boolean {
    if (statement.type != "Program") {
        return true
    }
    return false
}
