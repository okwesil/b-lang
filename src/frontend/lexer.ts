import { toss } from "../runtime/interpreter"

// let happy = 45 + ( foo * bar )
export interface Token {
    value: string
    type: TokenType
    line: number
    col: number
}

export enum TokenType {
    Number,
    String,
    Identifier,
    // reserved
    MutableVar,
    ConstantVar,
    Function,
    Return,
    While,
    If,

    Equals,
    And, Or, Spread,
    OpenParen, CloseParen,
    OpenCurlyBrace, CloseCurlyBrace,
    OpenBracket, CloseBracket,
    BinaryOperator,
    UnaryOperator,
    Semicolon,
    Colon,
    Comma,
    Dot,

    EOF, // end of file token type
}

const KEYWORDS: Record<string, TokenType> = {
    "let": TokenType.MutableVar,
    "const": TokenType.ConstantVar,
    "fn": TokenType.Function,
    "return": TokenType.Return,
    "while": TokenType.While,
    "if": TokenType.If,
    "or": TokenType.Or,
    "and": TokenType.And,
    "not": TokenType.UnaryOperator,
    "fan": TokenType.Spread
}


function isalpha(str: string): boolean {
    return str.toUpperCase() != str.toLowerCase()
}


function isint(str: any): boolean {
    return !isNaN(str) && !isskippable(str)
}

function isskippable(str: string): boolean {
    return str == " " || str == "\n" || str == "\t" || str == "\r"
}

export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>()
    const src = sourceCode.split("")    
    let location = {
        line: 1,
        col: 1
    }

    //build each token
    while (src.length > 0) {
        if (isskippable(src[0])) {
            let char = src.shift()
            switch(char) {
                case "\n":
                    location.line++
                    location.col = 1
                    break
                case " ":
                    location.col++
            }
            continue
        }


        // one character tokens
        switch(src[0]) {
            case "!":
                if (src[1] == "=") {
                    src.shift()
                    src.shift()
                    location.col += 2
                    tokens.push(tokenFrom("!=", TokenType.BinaryOperator, location.line, location.col))
                    continue
                }
                location.col++
                tokens.push(tokenFrom("!", TokenType.UnaryOperator, location.line, location.col))
                continue
            case "(":
                tokens.push(tokenFrom(src.shift(), TokenType.OpenParen, location.line, location.col))
                location.col++
                continue;
            case ")":
                tokens.push(tokenFrom(src.shift(), TokenType.CloseParen, location.line, location.col))
                location.col++
                continue
            case "{":
                tokens.push(tokenFrom(src.shift(), TokenType.OpenCurlyBrace, location.line, location.col))
                location.col++
                continue
            case "}":
                tokens.push(tokenFrom(src.shift(), TokenType.CloseCurlyBrace, location.line, location.col))
                location.col++
                continue
            case "[":
                tokens.push(tokenFrom(src.shift(), TokenType.OpenBracket, location.line, location.col))
                location.col++
                continue
            case "]":
                tokens.push(tokenFrom(src.shift(), TokenType.CloseBracket, location.line, location.col))
                location.col++
                continue
            case "*":
            case "/":
            case "+":
            case "%":
            case "^":
                tokens.push(tokenFrom(src.shift(), TokenType.BinaryOperator, location.line, location.col))
                location.col++
                continue
            case ">":
            case "<":
                if (src[1] == "=") {
                    let sign = src.shift()
                    src.shift()
                    location.col += 2
                    tokens.push(tokenFrom(sign + "=", TokenType.BinaryOperator, location.line, location.col))
                }
                location.col++
                tokens.push(tokenFrom(src.shift(), TokenType.BinaryOperator, location.line, location.col))
                continue
            case "-":
                // negative numbers
                if (isint(src[1])) {
                    src.shift()
                    let num = "-" // start with negative sign
                    location.col++
                    while (src.length > 0 && isint(src[0])) {
                        num += src.shift()
                        location.col++
                        // to get decimals
                        if (src[0] == "." as string && isint(src[1])) {
                            num += src.shift()
                            num += src.shift()
                            location.col += 2
                        }
                    }
                    tokens.push(tokenFrom(num, TokenType.Number, location.line, location.col))
                    continue
                }
                if (isalpha(src[1]) || src[1] == "(") {
                    location.col++
                    tokens.push(tokenFrom(src.shift(), TokenType.UnaryOperator, location.line, location.col))
                    continue
                }
                location.col++
                tokens.push(tokenFrom(src.shift(), TokenType.BinaryOperator, location.line, location.col))
                continue
            case "=":
                if (src[1] == "=") {
                    src.shift()
                    src.shift()
                    tokens.push(tokenFrom("==", TokenType.Equals, location.line, location.col))
                    continue
                }
                tokens.push(tokenFrom(src.shift(), TokenType.Equals, location.line, location.col))
                location.col++
                continue
            case ";":
                tokens.push(tokenFrom(src.shift(), TokenType.Semicolon, location.line, location.col))
                location.col++
                continue
            case ",":
                tokens.push(tokenFrom(src.shift(), TokenType.Comma, location.line, location.col))
                location.col++
                continue
            case ":": 
                tokens.push(tokenFrom(src.shift(), TokenType.Colon, location.line, location.col))
                location.col++
                continue
            case ".":
                tokens.push(tokenFrom(src.shift(), TokenType.Dot, location.line, location.col))
                location.col++
                continue
        }
    
        //multi-character tokens
        //build number token
        if (isint(src[0])) {
            let num = ""
            while (src.length > 0 && isint(src[0])) {
                num += src.shift()
                location.col++
                // to get decimals
                if (src[0] === "." && isint(src[1])) {
                    num += src.shift()
                    num += src.shift()
                    location.col += 2
                }
            }
            tokens.push(tokenFrom(num, TokenType.Number, location.line, location.col))
            continue
        }  
        if (isalpha(src[0]) || src[0] == "_") {
            let indentifier = ""
            while (src.length > 0 && (isalpha(src[0]) || src[0] == "_")) {
                indentifier += src.shift()
                location.col++
            }

            //check for reserved tokens before pushing
            const reserved = KEYWORDS[indentifier]
            if (!reserved)  {
                tokens.push(tokenFrom(indentifier, TokenType.Identifier, location.line, location.col))
            } else {
                tokens.push(tokenFrom(indentifier, reserved, location.line, location.col))
            }
            continue
        } 
        if (src[0] == "\"") {
            let str = ""
            src.shift() // get rid of opening quote
            while (src.length > 0 && src[0] != "\"") {
                str += src.shift()
                location.col++
            }
            src.shift() // get rid of closing quote
            tokens.push(tokenFrom(str, TokenType.String, location.line, location.col))
            continue
        }


        // If made it here that means unexpected token
        toss("Unexpected token: ", 100, location.line, location.col)

    }
    tokens.push({ value: "EndofFile", type: TokenType.EOF, line: location.line, col: location.col })


    return tokens
}


function tokenFrom(value: string = "", type: TokenType, line: number, col: number): Token {

    return {value, type, line, col}
}