import { Program, Statement, Expression, BinaryExp, Identifier, NumberLiteral, VariableDeclaration } from "./ast"
import { tokenize, Token, TokenType } from "./lexer"

export default class Parser {
    private tokens: Token[] = []
    private not_eof(): boolean {
        // return whether first token isn't eof 
        return this.tokens[0].type != TokenType.EOF
    }    
    private parse_statment(): Statement {
        // in future when we have statements like function declarations
        // we can use this function to parse them so for now return expression
        switch(this.get().type) {
            case TokenType.MutableVar:
            case TokenType.ConstantVar:
                return this.parse_variable_declaration()
            default:
                return this.parse_expression()
        }

    }

    /*
        format:
        ( const | let ) identifier = expression
        or
        ( const | let ) identifier;

    */
    private parse_variable_declaration(): Statement {
        const declarator = this.eat()
        const identifier = this.expect(TokenType.Identifier, "Unexpected token, expected: identifier").value
        let next = this.eat()

        // if no value at declaration
        if (next.type == TokenType.Semicolon) {
            if (declarator.type == TokenType.ConstantVar) {
                throw new Error("Constant variable declarations must be declared with a value")
            }
            return { 
                type: "VariableDeclaration",
                constant: false,
                identifier,  
            } as VariableDeclaration
        }

        if (next.type != TokenType.Equals) {
            throw new Error("Must have equals sign to declare variable")
        }

        const declaration: VariableDeclaration = { 
            type: "VariableDeclaration",
            constant: declarator.type == TokenType.ConstantVar,
            identifier,  
            value: this.parse_expression()
        } 
        // 
        this.expect(TokenType.Semicolon, "Expected semicolon after variable declaration")
        return declaration
    }


    /*
    
    Orders Of Precedence
    ( Order of Evaluation )

    AssignmentExpr - bottom 
    MemberExpr
    FunctionCall
    ComparisonExpr
    AdditiveExpr
    Multiplicative
    ( exponential )
    PrimaryExpr   - top

    */
    


    private parse_expression(): Expression {
        return this.parse_additive_expression()
    }

    // 10 + 5 - 5, treated as 
    // (10 + 5) - 5
    private parse_additive_expression(): Expression {
        let left = this.parse_multiplicative_expression()

        // while there is still an operator
        while(this.get().value == "+" || this.get().value == "-") {
            const operator = this.eat().value
            const right = this.parse_multiplicative_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }

    private parse_multiplicative_expression(): Expression {
        let left = this.parse_exponential_expression()

        // while there is still an operator
        while
        (
            this.get().value == "*" || this.get().value == "/" || this.get().value == "%"
        ) {
            const operator = this.eat().value
            const right = this.parse_exponential_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }

    private parse_exponential_expression(): Expression {
        let left = this.parse_primary_expression()

        // while there is still an operator
        while
        (
            this.get().value == "^" 
        ) {
            const operator = this.eat().value
            const right = this.parse_primary_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }
 

    // evaluates a token to a value (kinda)
    private parse_primary_expression(): Expression {
        const tk = this.get().type

        switch(tk) {
            case TokenType.Identifier:
                return { type: "Identifier", name: this.eat().value } as Identifier
            case TokenType.Number: 
                return { type: "NumberLiteral", value: parseFloat(this.eat().value) } as NumberLiteral
            case TokenType.OpenParen: 
                this.eat() // eat the opening paren
                const value = this.parse_expression() // parse parenthesis contents
                this.expect(
                    TokenType.CloseParen,
                    "Invalid or unexpected token found, Expected \")\""
                )
                return value
            default:
                process.exitCode = 101
                console.error(`Invalid or unexpected token found while parsing: { type: ${this.get().type}, value: ${this.get().value} }`)
                process.exit()
            
        }
    }

    /**
    * Returns the next token in the token stream without removing it.
    * @returns {Token} The next token in the token stream.
    */
    private get(): Token {
        return this.tokens[0]
    }
    /**
     * Consumes the next token from the token stream and returns it.
     * @returns {Token} The next token in the stream.
     */
    private eat(): Token {
        const prev = this.tokens.shift()
        return prev as Token
    }
    /**
     * Expects a token of the specified type and returns it. If the token does not match the expected type, logs an error and exits the process.
     * @param desiredType - The expected token type.
     * @param err - The error message to log if the token does not match the expected type.
     * @returns The previous token if it matches the expected type
     */
    private expect(desiredType: TokenType, err: string): Token  {
        const previous = this.eat()
        if (!previous || previous.type != desiredType) {
            console.error(err)
            process.exit()
        }
        return previous
    }

    public makeAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode)
        const program: Program = {
            type: "Program",
            body: []
        }

        //parse until end of file token
        while(this.not_eof()) {
            program.body.push(this.parse_statment())
        }
        return program;
    }
}
