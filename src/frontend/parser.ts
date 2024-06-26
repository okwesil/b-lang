import { toss } from "../runtime/interpreter"
import { 
    Program,
    Statement, 
    Expression, 
    BinaryExp, 
    Identifier, 
    NumberLiteral,
    StringLiteral,  
    VariableDeclaration, 
    FunctionDeclaration,
    AssignmentExp, 
    Property, 
    ObjectLiteral, 
    CallExp, MemberExp,
    ReturnStatement,
    WhileStatement,
    IfStatement,
    ArrayLiteral,
    UnaryExp,
    SpreadExp,
    Type,
    FunctionExp,
    ForStatement, 
} from "./ast"
import { tokenize, Token, TokenType } from "./lexer"

export default class Parser {
    private tokens: Token[] = []
    private not_eof(): boolean {
        // return whether first token isn't eof 
        return this.tokens[0].type != TokenType.EOF
    }    
    private parse_statement(): Statement {
        // in future when we have statements like function declarations
        // we can use this function to parse them so for now return expression
        switch(this.get().type) {
            case TokenType.MutableVar:
            case TokenType.ConstantVar:
                return this.parse_variable_declaration()
            case TokenType.Function:
                return this.parse_function_declaration()
            case TokenType.Return:
                return this.parse_return_statement()
            case TokenType.While:
                return this.parse_while_statement()
            case TokenType.If:
                return this.parse_if_statement()
            case TokenType.For:
                return this.parse_for_statement()
            default:
                return this.parse_expression()
        }

    }

    private parse_block(): Statement[] {
        let block = []
        while (this.not_eof() && this.get().type != TokenType.CloseCurlyBrace) {
            block.push(this.parse_statement())
        } 
        
        this.eat() // eat curly brace
        return block
    }

    /*
        format:
        ( const | let ) identifier = expression;
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
    private parse_function_declaration(): Statement {
        this.eat() // eat "fn" keyword

        /* 
            fn(arg, otherArg) => { Body } 
            or 
            fn(arg, otherArg) => arg + otherArg
                    
                    |
            function expression 
        */

        if (this.get().type == TokenType.OpenParen) {
            this.eat()
            const params = this.parse_args()
            let body: Statement[] = []
            if (this.get().type == TokenType.OpenCurlyBrace) {
                this.eat()
                while(this.not_eof() && this.get().type != TokenType.CloseCurlyBrace) {
                    body.push(this.parse_statement())
                }
                this.expect(TokenType.CloseCurlyBrace, "Expected closing curly brace after arrow function body")
            } else if (this.get().type == TokenType.Arrow) {
                this.eat()
                body.push(this.parse_expression())
            }
            
            return {
                type: "FunctionExp",
                params,
                body,
            } as FunctionExp
            
        }
        if (this.get().type != TokenType.Identifier) { 
            toss("Expected Identifier token after function keyword", 101) 
        }
        const declaration = {
            type: "FunctionDeclaration",
            name: { type: "Identifier", name: this.eat().value },
            params: new Array<Identifier>(),
            body: new Array<Statement>(),
            returnType: "null"
        } as FunctionDeclaration

        this.expect(TokenType.OpenParen, "Expected open parentheses in function declaration")

        while (this.not_eof() && this.get().type == TokenType.Identifier) {
            declaration.params.push({ type: "Identifier", name: this.eat().value })
            if (this.get().type == TokenType.Comma) {
                this.eat()
                // eat the upcoming comma for mutliple arguments
            }
        }

        this.expect(TokenType.CloseParen, "Expected closing parenthese after arguments")
        if (this.get().type == TokenType.Colon) {
            this.eat()
            declaration.returnType = this.expect(TokenType.ValueType, "Expected return type after colon in function declaration").value as Type
        }
        this.expect(TokenType.OpenCurlyBrace, "Expected Open Curly Brace after function declaration")


        while(this.not_eof() && this.get().type != TokenType.CloseCurlyBrace) {
            declaration.body.push(this.parse_statement())
        }

        this.eat() // eat curly brace

        return declaration
    }
    private parse_return_statement(): ReturnStatement {
        this.eat() // eat the return keyword
        return { 
            type: "ReturnStatement",
            value: this.get().type != TokenType.CloseCurlyBrace ? this.parse_expression(): null
        } as ReturnStatement
    }

    private parse_while_statement(): WhileStatement {
        this.eat() // eat while keyword
        const condition = this.parse_expression()
        const statement = { 
            type: "WhileStatement",
            condition,
            body: new Array<Statement>()
        } as WhileStatement
        statement.body = this.parse_block()

        return statement
    }

    private parse_if_statement(): IfStatement {
        this.eat() // eat if keyword
        const condition = this.parse_expression()
        const statement = { 
            type: "IfStatement",
            condition,
            body: new Array<Statement>()
        } as IfStatement
        this.expect(TokenType.OpenCurlyBrace, "Expected open curly brace in expression")
        while (this.not_eof() && this.get().type != TokenType.CloseCurlyBrace) {
            statement.body.push(this.parse_statement())
        } 
        
        this.eat() // eat curly brace

        return statement
    }
    
    private parse_for_statement(): ForStatement {
        this.eat()
        const statement = {
            type: "ForStatement",
            left: { 
                type: "Identifier", 
                name: this.expect(TokenType.Identifier, "Expected variable name in for loop").value 
            } as Identifier
        } as ForStatement
        this.expect(TokenType.Of, "Expected 'of' after variable name")
        statement.right = this.parse_expression()

        this.expect(TokenType.OpenCurlyBrace, "Expected open curly brace after for loop statement")
        statement.body = this.parse_block()


        return statement
    }

    

    /*
    
    Orders Of Precedence
    ( Order of Evaluation )

    Boolean - bottom
    AssignmentExpr  
    Object
    Array
    Logical OR     ||
    Logical AND     && 
    Equality     == != 
    Relational   <  > <= >=
    AdditiveExpr
    Multiplicative
    Exponential
    FunctionCall
    MemberExpr
    Unary
    PrimaryExpr   - top

    */
    


    private parse_expression(): Expression {
        return this.parse_assignment_expression()
    }

    private parse_unary_expression(): Expression {
        if (this.get().type != TokenType.UnaryOperator) {
            return this.parse_primary_expression()
        }   

        const operator = this.eat().value
        const target = this.parse_expression()

        return {
            type: "UnaryExp",
            operator,
            target
        } as UnaryExp
        
    }

    
    private parse_equality_expression(): Expression {
        let left = this.parse_relational_expression()

        // while there is still an operator
        while
        (
            this.get().value == "!=" || this.get().value == "==" 
        ) {
            const operator = this.eat().value
            const right = this.parse_relational_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }
    
    private parse_relational_expression(): Expression {
        let left = this.parse_additive_expression()

        // while there is still an operator
        while
        (
            this.get().value == ">" || this.get().value == "<" || this.get().value == "<=" || this.get().value == ">="
        ) {
            const operator = this.eat().value
            const right = this.parse_additive_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }

    private parse_logical_and_expression(): Expression {
        let left = this.parse_equality_expression()

        // while there is still an operator
        while
        (
            this.get().type == TokenType.And
        ) {
            const operator = this.eat().value
            const right = this.parse_equality_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }

    private parse_logical_or_expression(): Expression {
        let left = this.parse_logical_and_expression()

        // while there is still an operator
        while
        (
            this.get().type == TokenType.Or
        ) {
            const operator = this.eat().value
            const right = this.parse_logical_and_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }
    
    private parse_assignment_expression(): Expression {
        const left = this.parse_object_expression() 
        if (this.get().type == TokenType.Equals) {
            let operator = this.eat().value // go past equal sign
            const value = this.parse_object_expression()
            const expression = { value, assignee: left, type: "AssignmentExp", operator } as AssignmentExp
            return expression
        }

        return left
    }

    private parse_object_expression(): Expression {
        // expectation 1: { Property[] }

        if (this.get().type != TokenType.OpenCurlyBrace) {
            return this.parse_array_expression()
        }

        this.eat() // eat open curly brace
        const properties = new Array<Property>()

        while(this.not_eof() && this.get().type != TokenType.CloseCurlyBrace) {
            /*
                Expectations:
                { key: val, key2: val }
                { key, key2 }
                { key }
            */

            const key = this.expect(TokenType.Identifier, "Expected key in object literal").value;

            // handles shorthand
            // assuming key is a defined variable
            // { key, key2 }
            if (this.get().type == TokenType.Comma) {
                this.eat() // go past comma
                properties.push({ type: "Property", key,  })
                continue
                
            // handles 1 key-value pair shorthand
            // { key }
            } else if (this.get().type == TokenType.CloseCurlyBrace) {
                properties.push({ type: "Property", key })
                continue
            }

            this.expect(TokenType.Colon, "Missing colon in key value pair")
            const value = this.parse_expression()
            properties.push({ type: "Property", key, value })

            if (this.get().type != TokenType.CloseCurlyBrace) {
                this.expect(TokenType.Comma, "Expected comma of closing curly brace after property")
            }
        }


        this.expect(TokenType.CloseCurlyBrace, "Object should end in closing curly brace")
        return { properties, type: "ObjectLiteral" } as ObjectLiteral
    }

    private parse_array_expression(): Expression {
        if (this.get().type != TokenType.OpenBracket && this.get().type != TokenType.Spread) {
            return this.parse_logical_or_expression()
        }

        if (this.get().type == TokenType.Spread) {
            this.eat() // eat spread token
            return {
                type: "SpreadExp",
                argument: this.parse_expression()
            } as SpreadExp
        }
        
        this.eat() // eat opening bracket
        let elements: Expression[] = [this.parse_expression()]

        while (this.not_eof() && this.get().type != TokenType.CloseBracket) {
            this.expect(TokenType.Comma, "Expected comma after array element")
            elements.push(this.parse_expression())
        }
        this.expect(TokenType.CloseBracket, "Expected closing bracket")
        return { type: "ArrayLiteral", elements } as ArrayLiteral
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
        let left = this.parse_call_member_expression()

        // while there is still an operator
        while
        (
            this.get().value == "^" 
        ) {
            const operator = this.eat().value
            const right = this.parse_call_member_expression()
            left = {
                type: "BinaryExp",
                left,
                right,
                operator
            } as BinaryExp

        }

        return left
    }

    


    // if object member is a function
    private parse_call_member_expression(): Expression {
        const member = this.parse_member_expression()

        if (this.get().type == TokenType.OpenParen) {
            return this.parse_call_expression(member)
        } 
        return member
    }

    private parse_call_expression(caller: Expression): Expression {
        this.eat()
        let callExp: CallExp = { 
            type: "CallExp",
            caller,
            args: this.parse_args()
        }
        // obj.func()()
        // obj.func returns a func, so we want to handle this
        if (this.get().type == TokenType.OpenParen) {
            callExp = this.parse_call_expression(callExp) as CallExp
        }
        return callExp
    }

    /* 
        add(num1, func())
            ^^^^^^^^^^^^
           these are arguments; values passed to a 
           when its called / at runtime
        
        fn add(num1, num2) { Body }
               ^^^^^^^^^^  
            parameters are variables that a function is defined with

        sum: arguments are what you pass into a function,
            parameters are the arguments the function expects    

    */

    private parse_args(): Expression[] {
        const args = this.get().type == TokenType.CloseParen
            ? [] 
            : this.parse_argument_list()

        this.expect(TokenType.CloseParen, "Expected closing parentheses after argument list")
        return args    
    }
    
    // helper for ^^^
    private parse_argument_list(): Expression[] {
        const args: Expression[] = [this.parse_assignment_expression()] // first value
        /* 
            parse assignment because:
            let num = 5;
            add(num = 1, 7)
            that's valid code right there
        */
        while (this.get().type == TokenType.Comma && this.eat()) {
            args.push(this.parse_assignment_expression())
        }
        return args
    }

    private parse_member_expression(): Expression {
        let object = this.parse_unary_expression()

        while (this.get().type == TokenType.Dot || this.get().type == TokenType.OpenBracket) {
            const operator = this.eat() // . or [
            let property: Expression
            let computed: boolean

            // non-computed
            // foo.bar
            if (operator.type == TokenType.Dot) {
                computed = false
                property = this.parse_unary_expression() // should be identifier
                if (property.type != "Identifier") {
                    throw new Error("Computed member expression value must be an identifier")
                }


                // computed
                // foo["bar"]
            } else {
                computed = true
                property = this.parse_expression()
                this.expect(TokenType.CloseBracket, "Missing closing bracket in computed object expression")
            }

            object = { type: "MemberExp", object, computed, property } as MemberExp
        }
        return object
    }

    // evaluates a token to a value (kinda)
    private parse_primary_expression(): Expression {
        const tk = this.get().type

        switch(tk) {
            case TokenType.Identifier:
                return { type: "Identifier", name: this.eat().value } as Identifier
            case TokenType.Number: 
                return { type: "NumberLiteral", value: parseFloat(this.eat().value) } as NumberLiteral
            case TokenType.String:
                return { type: "StringLiteral", value: this.eat().value } as StringLiteral
            case TokenType.OpenParen: 
                this.eat() // eat the opening paren
                const value = this.parse_expression() // parse parenthesis contents
                this.expect(
                    TokenType.CloseParen,
                    "Invalid or unexpected token found, Expected \")\""
                )
                return value
            case TokenType.Function: 
                return this.parse_function_declaration()
            default:
                process.exitCode = 101
                throw new Error("Invalid or unexpected token found while parsing:\n" + JSON.stringify(this.get(), null, 2))
        }
    }

    /**
    * Returns the next token in the token stream without removing it.
    * @returns {Token} The next token in the token stream.
    */
    private get(index: number = 0): Token {
        return this.tokens[index]
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
            console.log("in -> " + JSON.stringify(previous, null, 2))
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
            program.body.push(this.parse_statement())
        }
        return program;
    }
}
