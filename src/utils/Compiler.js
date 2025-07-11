export class Compiler {
    constructor() {
        this.tokens = [];
        this.currentTokenIndex = 0;
        this.symbolTable = {};
        this.semanticErrors = [];
        this.semanticWarnings = [];
        this.ast = null;
    }

    tokenize(code) {
        const tokenDefinitions = [
            { type: 'FLOAT_N', regex: /^\d+\.\d+/ },
            { type: 'INTEGER', regex: /^\d+/ },
            { type: 'INT', regex: /^int\b/ },
            { type: 'FLOAT', regex: /^float\b/ },
            { type: 'IF', regex: /^if\b/ },
            { type: 'ELSE', regex: /^else\b/ },
            { type: 'WHILE', regex: /^while\b/ },
            { type: 'MAIN', regex: /^main\b/ },
            { type: 'ID', regex: /^[a-zA-Z_][a-zA-Z_0-9]*/ },
            { type: 'EQUALS', regex: /^==/ },
            { type: 'ASSIGN', regex: /^=/ },
            { type: 'NE', regex: /^!=/ },
            { type: 'LE', regex: /^<=/ },
            { type: 'GE', regex: /^>=/ },
            { type: 'LT', regex: /^</ },
            { type: 'GT', regex: /^>/ },
            { type: 'PLUS', regex: /^\+/ },
            { type: 'MINUS', regex: /^-/ },
            { type: 'TIMES', regex: /^\*/ },
            { type: 'DIVIDE', regex: /^\// },
            { type: 'LPAREN', regex: /^\(/ },
            { type: 'RPAREN', regex: /^\)/ },
            { type: 'LBRACE', regex: /^\{/ },
            { type: 'RBRACE', regex: /^\}/ },
            { type: 'SEMI', regex: /^;/ },
            { type: 'COMMA', regex: /^,/ },
            { type: 'WHITESPACE', regex: /^\s+/ },
        ];
        
        let remainingCode = code;
        this.tokens = [];
        let line = 1;

        while (remainingCode.length > 0) {
            let matched = false;
            for (const def of tokenDefinitions) {
                const match = remainingCode.match(def.regex);
                if (match) {
                    const value = match[0];
                    if (def.type !== 'WHITESPACE') {
                        this.tokens.push({ type: def.type, value, line });
                    }
                    if (def.type === 'WHITESPACE' || value.includes('\n')) {
                        line += (value.match(/\n/g) || []).length;
                    }
                    remainingCode = remainingCode.substring(value.length);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                this.semanticErrors.push(`Erro Léxico: Caractere inválido na linha ${line}: ${remainingCode[0]}`);
                return;
            }
        }
    }

    peek() { return this.tokens[this.currentTokenIndex]; }
    isAtEnd() { return this.currentTokenIndex >= this.tokens.length; }
    advance() { if (!this.isAtEnd()) this.currentTokenIndex++; return this.tokens[this.currentTokenIndex - 1]; }
    match(...types) {
        if (this.isAtEnd()) return false;
        if (types.includes(this.peek().type)) {
            return true;
        }
        return false;
    }
    consume(type, message) {
        if (this.match(type)) return this.advance();
        const token = this.peek() || {line: 'fim'};
        throw new Error(`Erro Sintático (linha ${token.line}): ${message}. Esperava ${type} mas encontrou ${token.type || 'EOF'}`);
    }

    addError(message, line) { this.semanticErrors.push(`Erro Semântico (linha ${line}): ${message}`); }
    addWarning(message, line) { this.semanticWarnings.push(`Aviso Semântico (linha ${line}): ${message}`); }
    
    checkRedeclaration(name, line) {
        if (this.symbolTable[name]) {
            this.addError(`Variável '${name}' já declarada.`, line);
            return false;
        }
        return true;
    }

    checkDeclaration(name, line) {
        if (!this.symbolTable[name]) {
            this.addError(`Variável '${name}' não foi declarada.`, line);
            return null;
        }
        return this.symbolTable[name];
    }
    
    checkInitialization(name, line) {
        const symbol = this.symbolTable[name];
        if (symbol && !symbol.initialized) {
            this.addWarning(`Variável '${name}' usada antes de ser inicializada.`, line);
        }
    }

    checkAssignmentType(varType, exprType, line) {
        if (varType !== exprType && !(varType === 'float' && exprType === 'int')) {
            this.addError(`Não é possível atribuir tipo '${exprType}' a uma variável do tipo '${varType}'.`, line);
        }
    }

    checkArithmeticType(type1, type2, line) {
        if (type1 === type2) return type1;
        if ((type1 === 'float' && type2 === 'int') || (type1 === 'int' && type2 === 'float')) return 'float';
        this.addError(`Operação com tipos incompatíveis: '${type1}' e '${type2}'.`, line);
        return 'error';
    }

    parse() {
        try {
            this.ast = this.program();
        } catch (e) {
            this.semanticErrors.push(e.message);
            this.ast = null;
        }
    }

    program() {
        this.consume('INT', 'Programa deve começar com "int main()"');
        this.consume('MAIN', 'Programa deve começar com "int main()"');
        this.consume('LPAREN', 'Esperado "(" após "main"');
        this.consume('RPAREN', 'Esperado ")" após "main()"');
        this.consume('LBRACE', 'Esperado "{" para iniciar o bloco principal');
        const declarations = this.declarations();
        const commands = this.commands();
        this.consume('RBRACE', 'Esperado "}" para fechar o bloco principal');
        return { type: 'Program', declarations, commands };
    }

    declarations() {
        const decls = [];
        while (this.match('INT', 'FLOAT')) {
            decls.push(this.declaration());
        }
        return decls;
    }

    declaration() {
        const type = this.advance().value;
        const idList = [];
        do {
            const idToken = this.consume('ID', 'Esperado nome da variável.');
            if (this.checkRedeclaration(idToken.value, idToken.line)) {
                this.symbolTable[idToken.value] = { type, initialized: false, line: idToken.line };
            }
            idList.push({type: 'Identifier', name: idToken.value});
        } while (this.match('COMMA') && this.advance());
        this.consume('SEMI', 'Declarações devem terminar com ";".');
        return { type: 'Declaration', varType: type, variables: idList };
    }

    commands() {
        const cmds = [];
        while (!this.match('RBRACE') && !this.isAtEnd()) {
            cmds.push(this.command());
        }
        return cmds;
    }

    command() {
        if (this.match('IF')) return this.ifStatement();
        if (this.match('WHILE')) return this.whileStatement();
        if (this.match('ID')) return this.assignment();
        if (this.match('LBRACE')) {
            this.advance();
            const commands = this.commands();
            this.consume('RBRACE', 'Esperado "}" para fechar o bloco.');
            return { type: 'Block', commands };
        }
        throw new Error(`Comando inválido na linha ${this.peek().line}.`);
    }

    assignment() {
        const idToken = this.consume('ID', 'Atribuição deve começar com uma variável.');
        const symbol = this.checkDeclaration(idToken.value, idToken.line);
        this.consume('ASSIGN', 'Esperado "=" em uma atribuição.');
        const expression = this.expression();
        this.consume('SEMI', 'Comandos de atribuição devem terminar com ";".');
        
        if (symbol) {
            this.checkAssignmentType(symbol.type, expression.dataType, idToken.line);
            this.symbolTable[idToken.value].initialized = true;
        }
        return { type: 'Assignment', variable: idToken.value, value: expression };
    }
    
    ifStatement() {
        this.consume('IF', 'Erro no if.');
        this.consume('LPAREN', 'Esperado "(" após "if".');
        const condition = this.expression();
        this.consume('RPAREN', 'Esperado ")" após a condição do if.');
        const thenBranch = this.command();
        let elseBranch = null;
        if (this.match('ELSE')) {
            this.advance();
            elseBranch = this.command();
        }
        return { type: 'IfStatement', condition, thenBranch, elseBranch };
    }

    whileStatement() {
        this.consume('WHILE', 'Erro no while.');
        this.consume('LPAREN', 'Esperado "(" após "while".');
        const condition = this.expression();
        this.consume('RPAREN', 'Esperado ")" após a condição do while.');
        const body = this.command();
        return { type: 'WhileStatement', condition, body };
    }

    expression() { return this.equality(); }
    equality() {
        let expr = this.comparison();
        while (this.match('EQUALS', 'NE')) {
            const operator = this.advance().type;
            const right = this.comparison();
            this.checkArithmeticType(expr.dataType, right.dataType, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: 'boolean' };
        }
        return expr;
    }
    comparison() {
        let expr = this.term();
        while (this.match('GT', 'GE', 'LT', 'LE')) {
            const operator = this.advance().type;
            const right = this.term();
            this.checkArithmeticType(expr.dataType, right.dataType, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: 'boolean' };
        }
        return expr;
    }
    term() {
        let expr = this.factor();
        while (this.match('PLUS', 'MINUS')) {
            const operator = this.advance().type;
            const right = this.factor();
            const resultType = this.checkArithmeticType(expr.dataType, right.dataType, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: resultType };
        }
        return expr;
    }
    factor() {
        let expr = this.primary();
        while (this.match('TIMES', 'DIVIDE')) {
            const operator = this.advance().type;
            const right = this.primary();
            const resultType = this.checkArithmeticType(expr.dataType, right.dataType, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: resultType };
        }
        return expr;
    }
    primary() {
        if (this.match('INTEGER')) {
            const token = this.advance();
            return { type: 'Literal', value: parseInt(token.value), dataType: 'int' };
        }
        if (this.match('FLOAT_N')) {
            const token = this.advance();
            return { type: 'Literal', value: parseFloat(token.value), dataType: 'float' };
        }
        if (this.match('ID')) {
            const token = this.advance();
            const symbol = this.checkDeclaration(token.value, token.line);
            this.checkInitialization(token.value, token.line);
            return { type: 'Identifier', name: token.value, dataType: symbol ? symbol.type : 'error' };
        }
        if (this.match('LPAREN')) {
            this.advance();
            const expr = this.expression();
            this.consume('RPAREN', 'Esperado ")" após a expressão.');
            return { type: 'Grouping', expression: expr, dataType: expr.dataType };
        }
        throw new Error(`Expressão inválida na linha ${this.peek().line}. Token inesperado: ${this.peek().value}`);
    }

    analyze(code) {
        this.currentTokenIndex = 0;
        this.symbolTable = {};
        this.semanticErrors = [];
        this.semanticWarnings = [];
        this.ast = null;

        this.tokenize(code);
        if (this.semanticErrors.length > 0) return;

        this.parse();
    }
}