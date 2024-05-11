import { Program, Statement, Expression, BinaryExp, Identifier, NumberLiteral, NullLiteral } from "./ast"
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



        return this.parse_expression()
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
            case TokenType.Null:
                this.eat() // advance past null keyword
                return { type: "NullLiteral", value: "null" } as NullLiteral

            default:
                process.exitCode = 101
                console.error(`Invalid or unexpected token found while parsing: { type: ${this.get().type}, value: ${this.get().value} }`)
                process.exit()
            
        }
    }

    private get(): Token {
        return this.tokens[0]
    } 
    private eat(): Token {
        const prev = this.tokens.shift()
        return prev as Token
    }
    private expect(desiredType: TokenType, err: string): Token | undefined {
        const previous = this.tokens.shift()
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
