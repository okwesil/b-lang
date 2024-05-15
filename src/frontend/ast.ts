import { RuntimeValue } from "../runtime/values"

export type NodeType = 
    // statements
    "Program" 
    | "VariableDeclaration"
    // expressions
    | "NumberLiteral" 
    | "StringLiteral"
    | "Identifier" 
    | "BinaryExp" 
    | "AssignmentExp"
    | "Property"
    | "ObjectLiteral"
    | "MemberExp"
    | "CallExp"


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

/*
    normal format:
        x = {} 
    assignee is expression because:
        x.foo = {}
        ^^^
        that is a member expression, not an identifier
        so to support these we wouldn't want to make assignee a string
        because thats not a string
*/
export interface AssignmentExp extends Expression {
    type: "AssignmentExp"
    assignee: Expression
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

export interface StringLiteral extends Expression {
    type: "StringLiteral",
    value: string
}

export interface ObjectLiteral extends Expression {
    type: "ObjectLiteral",
    properties: Property[] 
}

export interface Property extends Expression {
    type: "Property",
    key: string,
    value?: Expression 
}

export interface Program extends Statement {
    type: "Program"
    body: Statement[]
}

export interface MemberExp extends Expression {
    type: "MemberExp",
    object: Expression
    property: Expression
    computed: boolean
}

export interface CallExp extends Expression {
    type: "CallExp",
    args: Expression[],
    caller: Expression
}


