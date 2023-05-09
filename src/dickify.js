import GLOBAL_VARIABLES from './global_variables.js'  // window 下的属性
import KEYWORDS from './keywords.js'  // 关键字

class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

const LexerState = {
    WAITING: 'waiting',
    IDENTIFIER: 'identifier',
    STRING: 'string',
    PROPERTY: 'property',
    REGEXP: 'regexp',
    PATTERN_STRING: 'pattern_string',
}

const TokenType = {
    OTHER: 'other',
    IDENTIFIER: 'identifier',
    STRING: 'string',
    PROPERTY: 'property',
    GLOBAL_VARIABLE: 'global_variable',
    REGEXP: 'regexp',
    PATTERN_STRING: 'pattern_string',
}


class JavaScriptDickifier {
    constructor({
        code = '',
        identifierCharCode = 65,
        identifierCharTimes = 1,
        identifiers = {},
                }) {
        this.code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')  // remove comments
        // 词法分析相关
        this.pos = 0
        this.state = LexerState.WAITING
        this.currentChar = ''
        this.cache = ''
        this.tokens = []
        // dickify 相关
        this.identifierCharCode = identifierCharCode
        this.identifierCharTimes = identifierCharTimes
        this.dickifiedStrings = []
        this.identifiers = identifiers
        this.dickifiedCode = ''
    }

    identifierRegExp = new RegExp(/[a-zA-Z_$]/)

    lexWaiting() {
        // 等待状态
        if (this.currentChar === '"' || this.currentChar === "'") {
            this.state = LexerState.STRING
            this.tokens.push(
                new Token(TokenType.OTHER, this.cache)
            )
            this.cache = ''
        } else if (this.currentChar === '.') {
            this.state = LexerState.PROPERTY
            this.tokens.push(
                new Token(TokenType.OTHER, this.cache)
            )
            this.cache = ''
        } else if (this.identifierRegExp.test(this.currentChar)) {
            this.state = LexerState.IDENTIFIER
            this.tokens.push(
                new Token(TokenType.OTHER, this.cache)
            )
            this.cache = ''
        } else if (this.currentChar === '/') {
            this.state = LexerState.REGEXP
            this.tokens.push(
                new Token(TokenType.OTHER, this.cache)
            )
            this.cache = ''
        } else if (this.currentChar === '`') {
            this.state = LexerState.PATTERN_STRING
            this.tokens.push(
                new Token(TokenType.OTHER, this.cache)
            )
            this.cache = ''
        }

        this.cache += this.currentChar
        this.pos++

        if (this.pos === this.code.length) {
            this.tokens.push(
                new Token(TokenType.OTHER, this.cache)
            )
        }
    }

    lexString() {
        // 字符串
        if (this.currentChar === '"' || this.currentChar === "'") {
            this.cache += this.currentChar
            this.pos++
            this.tokens.push(
                new Token(TokenType.STRING, this.cache)
            )
            this.state = LexerState.WAITING
            this.cache = ''
            return
        }
        this.cache += this.currentChar
        this.pos++

        if (this.pos === this.code.length) {
            this.tokens.push(
                new Token(TokenType.STRING, this.cache)
            )
        }
    }

    lexPatternString() {
        if (this.currentChar === '`') {
            this.cache += this.currentChar
            this.pos++
            this.tokens.push(
                new Token(TokenType.PATTERN_STRING, this.cache)
            )
            this.state = LexerState.WAITING
            this.cache = ''
            return
        }
        this.cache += this.currentChar
        this.pos++
    }

    lexProperty() {
        // 对象属性/方法
        if (this.cache !== '.' && !this.identifierRegExp.test(this.currentChar)) {
            this.tokens.push(
                new Token(TokenType.PROPERTY, this.cache.slice(1))
            )
            this.state = LexerState.WAITING
            this.cache = ''
            return
        }
        this.cache += this.currentChar
        this.pos++

        if (this.pos === this.code.length) {
            this.tokens.push(
                new Token(TokenType.PROPERTY, this.cache.slice(1))
            )
        }
    }

    lexIdentifier() {
        // 变量名等
        if (!this.identifierRegExp.test(this.currentChar)) {
            let tokenType = TokenType.IDENTIFIER
            if (KEYWORDS.includes(this.cache)) {
                tokenType = TokenType.OTHER
            } else if (GLOBAL_VARIABLES.includes(this.cache)) {
                tokenType = TokenType.GLOBAL_VARIABLE
            }
            this.tokens.push(
                new Token(tokenType, this.cache)
            )
            this.state = LexerState.WAITING
            this.cache = ''
            return
        }
        this.cache += this.currentChar
        this.pos++

        if (this.pos === this.code.length) {
            this.tokens.push(
                new Token(TokenType.IDENTIFIER, this.cache)
            )
        }
    }

    lexRegExp() {
        // 正则表达式
        if (this.currentChar === '/') {
            this.cache += this.currentChar
            this.pos++
            this.tokens.push(
                new Token(TokenType.REGEXP, this.cache)
            )
            this.state = LexerState.WAITING
            this.cache = ''
            return
        }
        this.cache += this.currentChar
        this.pos++

        if (this.pos === this.code.length) {
            this.tokens.push(
                new Token(TokenType.REGEXP, this.cache)
            )
        }
    }

    applyStateMethod() {
        // 根据状态调用对应的方法
        this.currentChar = this.code[this.pos]
        switch (this.state) {
            case LexerState.WAITING:
                this.lexWaiting()
                break
            case LexerState.IDENTIFIER:
                this.lexIdentifier()
                break
            case LexerState.STRING:
                this.lexString()
                break
            case LexerState.PROPERTY:
                this.lexProperty()
                break
            case LexerState.REGEXP:
                this.lexRegExp()
                break
            case LexerState.PATTERN_STRING:
                this.lexPatternString()
                break
        }
    }

    lex() {
        while (this.pos < this.code.length) {
            this.applyStateMethod()
        }
        return this.tokens
    }

    dickify() {
        let dickifiedCode = ''
        this.tokens.forEach(token => {
            switch (token.type) {
                case TokenType.OTHER:
                    dickifiedCode += (token.value === " ") ? " " : token.value.replaceAll(' ', '')
                    break
                case TokenType.IDENTIFIER:
                    // minify identifiers
                    if (!(token.value in this.identifiers)) {
                        let minifiedIdentifier = ''
                        minifiedIdentifier = String.fromCharCode(this.identifierCharCode).repeat(this.identifierCharTimes)
                        this.identifierCharCode++
                        if (this.identifierCharCode > 90) {
                            this.identifierCharCode = 65
                            this.identifierCharTimes++
                        }
                        this.identifiers[token.value] = minifiedIdentifier
                    }
                    dickifiedCode += this.identifiers[token.value]
                    break
                case TokenType.STRING:
                    // minify strings
                    let idx
                    const stringValue = token.value.slice(1, -1)
                    if (!this.dickifiedStrings.includes(stringValue)) {
                        this.dickifiedStrings.push(stringValue)
                        idx = this.dickifiedStrings.length - 1
                    } else {
                        idx = this.dickifiedStrings.indexOf(stringValue)
                    }
                    dickifiedCode += ('b[' + idx + ']')
                    break
                case TokenType.PROPERTY:
                    let idx2
                    if (!this.dickifiedStrings.includes(token.value)) {
                        this.dickifiedStrings.push(token.value)
                        idx2 = this.dickifiedStrings.length - 1
                    } else {
                        idx2 = this.dickifiedStrings.indexOf(token.value)
                    }
                    dickifiedCode += ('[b[' + 'idx2' + ']]')
                    break
                case TokenType.GLOBAL_VARIABLE:
                    let idx3
                    if (!this.dickifiedStrings.includes(token.value)) {
                        this.dickifiedStrings.push(token.value)
                        idx3 = this.dickifiedStrings.length - 1
                    } else {
                        idx3 = this.dickifiedStrings.indexOf(token.value)
                    }
                    dickifiedCode += ('window[b[' + idx3 + ']]')
                    break
                case TokenType.REGEXP:
                    dickifiedCode += token.value
                    break
                case TokenType.PATTERN_STRING:
                    // match all patterns ${}
                    let patternString = token.value.slice(1, -1)
                    const patternRegExp = /\$\{[^\}]+\}/g
                    const patternMatches = patternString.match(patternRegExp)
                    if (patternMatches) {
                        patternMatches.forEach(match => {
                            const patternContent = match.slice(2, -1)
                            const dickifier = new JavaScriptDickifier({
                                code: patternContent,
                                identifiers: this.identifiers,
                                identifierCharTimes: this.identifierCharTimes,
                                identifierCharCode: this.identifierCharCode,
                            })
                            dickifier.lex()
                            patternString = patternString.replace(match, '${' + dickifier.dickify()[1] + '}')
                        })
                    }
                    dickifiedCode += ('`' + patternString + '`')
            }
        })

        this.dickifiedCode = dickifiedCode


        for (let [searchValue, replaceValue] of [
            ['\t', ''],
            ['\n\n', '\n'],
            ['{\n', '{'],
            ['}\n', '}'],
            [';\n', ';'],
            [')\n}', ')}'],
            ['))', '))'],
        ]) {
            this.dickifiedCode = this.dickifiedCode.replaceAll(searchValue, replaceValue)
        }

        const encodedDickifiedStrings = []
        this.dickifiedStrings.forEach((string, idx) => {
            encodedDickifiedStrings.push("'" + btoa(string) + "'")
        })

        const dickifiedCodeHeads = 'let b = [' + encodedDickifiedStrings.join(',') + '];b=b.map(v=>atob(v))\n'

        return [
            dickifiedCodeHeads,
            this.dickifiedCode.trim()
        ]
    }

}

const dickify = (code) => {
    if (code.includes(atob('ZXZhbA=='))) {
        throw new Error('Your code is dickful enough!')
    }
    const dickifier = new JavaScriptDickifier({
        code: code
    })
    dickifier.lex()
    return dickifier.dickify().join('')
}

export {dickify, JavaScriptDickifier}