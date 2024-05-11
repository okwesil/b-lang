export type NodeType = "Program" | "NumberLiteral" | "NullLiteral" | "Identifier" | "BinaryExp";
export type Operator = "+" | "-" | "*" | "/" | "%" | "^"


// statement doen't inherently return a value
export interface Statement {
    type: NodeType
}
export interface AssignmentStmt extends Statement {
    variable: Identifier,
    valueToAssign: number
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

export interface NullLiteral extends Expression {
    type: "NullLiteral",
    value: "null"
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
