// let happy = 45 + ( foo * bar )
export interface Token {
    value: string
    type: TokenType
}

export enum TokenType {
    Number,
    String,
    Identifier,
    
    Equals,
    MutableVar,
    ConstantVar,

    OpenParen, CloseParen,
    OpenCurlyBrace, CloseCurlyBrace,
    OpenBracket, CloseBracket,
    BinaryOperator,
    Semicolon,
    Colon,
    Comma,

    EOF, // end of file token type
}

const KEYWORDS: Record<string, TokenType> = {
    "let": TokenType.MutableVar,
    "const": TokenType.ConstantVar
}


function isalpha(str: string): boolean {
    return str.toUpperCase() != str.toLowerCase()
}


function isint(str: any): boolean {
    return !isNaN(str) && !isskippable(str)
}

function isskippable(str: string): boolean {
    return str == " " || str == "\n" || str == "\t"
}

export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>()
    const src = sourceCode.split("")    

    //build each token
    while (src.length > 0) {
        if (isskippable(src[0])) {
            src.shift()
            continue
        }


        // one character tokens
        switch(src[0]) {
            case "(":
                tokens.push(tokenFrom(src.shift(), TokenType.OpenParen))
                continue;
            case ")":
                tokens.push(tokenFrom(src.shift(), TokenType.CloseParen))
                continue
            case "{":
                tokens.push(tokenFrom(src.shift(), TokenType.OpenCurlyBrace))
                continue
            case "}":
                tokens.push(tokenFrom(src.shift(), TokenType.CloseCurlyBrace))
                continue
            case "[":
                tokens.push(tokenFrom(src.shift(), TokenType.OpenBracket))
                continue
            case "]":
                tokens.push(tokenFrom(src.shift(), TokenType.CloseBracket))
                continue
            case "*":
            case "/":
            case "+":
            case "-":
            case "%":
            case "^":
                tokens.push(tokenFrom(src.shift(), TokenType.BinaryOperator))
                continue
            case "=":
                tokens.push(tokenFrom(src.shift(), TokenType.Equals))
                continue
            case ";":
                tokens.push(tokenFrom(src.shift(), TokenType.Semicolon))
                continue
            case ",":
                tokens.push(tokenFrom(src.shift(), TokenType.Comma))
                continue
            case ":": 
                tokens.push(tokenFrom(src.shift(), TokenType.Colon))
                continue
        }
    
        //multi-character tokens
        //build number token
        if (isint(src[0])) {
            let num = ""
            while (src.length > 0 && isint(src[0])) {
                num += src.shift()
                // to get decimals
                if (src[1] == "." && isint(src[2])) {
                    num += src.shift()
                    num += src.shift()
                }
            }
            tokens.push(tokenFrom(num, TokenType.Number))
            
        } else if (isalpha(src[0])) {
            let indentifier = ""
            while (src.length > 0 && isalpha(src[0])) {
                indentifier += src.shift()
            }

            //check for reserved tokens before pushing
            const reserved = KEYWORDS[indentifier]
            if (!reserved)  {
                tokens.push(tokenFrom(indentifier, TokenType.Identifier))
            } else {
                tokens.push(tokenFrom(indentifier, reserved))
            }
        }  else {

            // If made it here that means unexpected token
            process.exitCode = 100
            console.error("Unexpected token: " + src[0])
            process.exit()

        }


    }
    tokens.push({ value: "EndofFile", type: TokenType.EOF })


    return tokens
} 


function tokenFrom(value: string = "", type: TokenType): Token {
    return {value, type}
}