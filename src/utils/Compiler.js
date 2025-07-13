/**
 * @class Compiler
 * @description Uma classe que implementa um compilador para uma linguagem semelhante a C.
 * Realiza análise léxica, sintática e semântica, suportando escopo de bloco,
 * laços (while, for, do-while), condicionais (if-else) e uma variedade de operadores.
 */
export class Compiler {
    constructor() {
        this.tokens = [];
        this.currentTokenIndex = 0;
        // A tabela de símbolos agora é uma pilha para gerenciar escopos.
        this.scopeChain = []; 
        this.semanticErrors = [];
        this.semanticWarnings = [];
        this.ast = null;
        // Guarda o tipo de retorno da função atual (para validar o 'return').
        this.currentFunctionReturnType = null; 
    }

    /**
     * Análise Léxica (Tokenizer)
     * Converte o código fonte em uma lista de tokens.
     * @param {string} code - O código fonte a ser tokenizado.
     */
    tokenize(code) {
        const tokenDefinitions = [
            // Comentários devem vir primeiro para serem removidos corretamente
            { type: 'COMMENT_BLOCK', regex: /^\/\*[\s\S]*?\*\// },
            { type: 'COMMENT_LINE', regex: /^\/\/.*/ },
            
            // Tipos e Palavras-chave
            { type: 'FLOAT', regex: /^float\b/ },
            { type: 'INT', regex: /^int\b/ },
            { type: 'CHAR', regex: /^char\b/ },
            { type: 'VOID', regex: /^void\b/ },
            { type: 'IF', regex: /^if\b/ },
            { type: 'ELSE', regex: /^else\b/ },
            { type: 'WHILE', regex: /^while\b/ },
            { type: 'FOR', regex: /^for\b/ },
            { type: 'DO', regex: /^do\b/ },
            { type: 'RETURN', regex: /^return\b/ },
            { type: 'MAIN', regex: /^main\b/ },

            // Literais
            { type: 'FLOAT_N', regex: /^\d+\.\d+/ },
            { type: 'INTEGER', regex: /^\d+/ },
            { type: 'CHAR_LITERAL', regex: /^'(.|\\.)'/ },

            // Operadores
            { type: 'EQUALS', regex: /^==/ },
            { type: 'NE', regex: /^!=/ },
            { type: 'LE', regex: /^<=/ },
            { type: 'GE', regex: /^>=/ },
            { type: 'LOGICAL_AND', regex: /^&&/ },
            { type: 'LOGICAL_OR', regex: /^\|\|/ },
            { type: 'ASSIGN', regex: /^=/ },
            { type: 'LT', regex: /^</ },
            { type: 'GT', regex: /^>/ },
            { type: 'PLUS', regex: /^\+/ },
            { type: 'MINUS', regex: /^-/ },
            { type: 'TIMES', regex: /^\*/ },
            { type: 'DIVIDE', regex: /^\// },
            { type: 'MODULO', regex: /^%/ },
            { type: 'LOGICAL_NOT', regex: /^!/ },

            // Pontuação
            { type: 'LPAREN', regex: /^\(/ },
            { type: 'RPAREN', regex: /^\)/ },
            { type: 'LBRACE', regex: /^\{/ },
            { type: 'RBRACE', regex: /^\}/ },
            { type: 'SEMI', regex: /^;/ },
            { type: 'COMMA', regex: /^,/ },

            // Identificador
            { type: 'ID', regex: /^[a-zA-Z_][a-zA-Z_0-9]*/ },
            
            // Espaço em branco (ignorado, mas usado para contar linhas)
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
                    // Ignora comentários e espaços em branco, mas conta as novas linhas
                    if (def.type !== 'WHITESPACE' && def.type !== 'COMMENT_BLOCK' && def.type !== 'COMMENT_LINE') {
                        this.tokens.push({ type: def.type, value, line });
                    }
                    
                    if (value.includes('\n')) {
                        line += (value.match(/\n/g) || []).length;
                    }
                    
                    remainingCode = remainingCode.substring(value.length);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                this.semanticErrors.push(`Erro Léxico: Caractere inválido na linha ${line}: ${remainingCode[0]}`);
                return; // Para a análise em caso de erro léxico
            }
        }
    }

    // --- Métodos Utilitários do Parser ---
    peek() { return this.tokens[this.currentTokenIndex]; }
    isAtEnd() { return this.currentTokenIndex >= this.tokens.length; }
    advance() { if (!this.isAtEnd()) this.currentTokenIndex++; return this.tokens[this.currentTokenIndex - 1]; }
    match(...types) {
        if (this.isAtEnd()) return false;
        return types.includes(this.peek().type);
    }
    consume(type, message) {
        if (this.match(type)) return this.advance();
        const token = this.peek() || { line: 'fim' };
        throw new Error(`Erro Sintático (linha ${token.line}): ${message}. Esperava ${type} mas encontrou ${token.type || 'EOF'}`);
    }

    // --- Métodos de Análise Semântica e Gerenciamento de Escopo ---
    addError(message, line) { this.semanticErrors.push(`Erro Semântico (linha ${line}): ${message}`); }
    addWarning(message, line) { this.semanticWarnings.push(`Aviso Semântico (linha ${line}): ${message}`); }
    
    beginScope() { this.scopeChain.push({}); }
    endScope() { this.scopeChain.pop(); }

    addSymbol(name, type, line) {
        const currentScope = this.scopeChain[this.scopeChain.length - 1];
        if (currentScope[name]) {
            this.addError(`Variável '${name}' já declarada neste escopo.`, line);
            return false;
        }
        currentScope[name] = { type, initialized: false, line };
        return true;
    }

    findSymbol(name) {
        for (let i = this.scopeChain.length - 1; i >= 0; i--) {
            if (this.scopeChain[i][name]) {
                return this.scopeChain[i][name];
            }
        }
        return null;
    }

    checkDeclaration(name, line) {
        const symbol = this.findSymbol(name);
        if (!symbol) {
            this.addError(`Variável '${name}' não foi declarada.`, line);
            return null;
        }
        return symbol;
    }
    
    checkInitialization(name, line) {
        const symbol = this.findSymbol(name);
        if (symbol && !symbol.initialized) {
            this.addWarning(`Variável '${name}' usada antes de ser inicializada.`, line);
        }
    }

    setInitialized(name) {
        for (let i = this.scopeChain.length - 1; i >= 0; i--) {
            if (this.scopeChain[i][name]) {
                this.scopeChain[i][name].initialized = true;
                return;
            }
        }
    }

    checkAssignmentType(varType, exprType, line) {
        // Permite coerção de int/char para float, mas não o contrário.
        const compatible = (varType === 'float' && (exprType === 'int' || exprType === 'char')) || varType === exprType;
        if (!compatible) {
            this.addError(`Não é possível atribuir tipo '${exprType}' a uma variável do tipo '${varType}'.`, line);
        }
    }

    checkArithmeticType(type1, type2, op, line) {
        if (op === 'MODULO' && (type1 !== 'int' || type2 !== 'int')) {
            this.addError(`Operador '%' requer operandos do tipo 'int'.`, line);
            return 'error';
        }
        if (type1 === 'error' || type2 === 'error') return 'error';
        if (type1 === 'float' || type2 === 'float') return 'float';
        if (type1 === 'int' || type2 === 'int') return 'int';
        return 'char'; // Operação entre chars resulta em char (promovido a int na prática)
    }

    // --- Métodos de Parsing (Análise Sintática) ---
    
    parse() {
        try {
            this.ast = this.program();
        } catch (e) {
            this.semanticErrors.push(e.message);
            this.ast = null;
        }
    }

    program() {
        this.beginScope(); // Escopo global
        // Permite "int main()" ou "void main()"
        const returnTypeToken = this.consume(this.match('VOID') ? 'VOID' : 'INT', 'Programa deve começar com "int main()" ou "void main()"');
        this.currentFunctionReturnType = returnTypeToken.value;

        this.consume('MAIN', 'Esperado "main" após o tipo de retorno.');
        this.consume('LPAREN', 'Esperado "(" após "main"');
        this.consume('RPAREN', 'Esperado ")" após "main()"');
        
        const body = this.block();
        
        this.endScope(); // Fim do escopo global
        return { type: 'Program', returnType: this.currentFunctionReturnType, body };
    }

    block() {
        this.consume('LBRACE', 'Esperado "{" para iniciar um bloco.');
        this.beginScope();
        const declarations = this.declarations();
        const commands = this.commands();
        this.endScope();
        this.consume('RBRACE', 'Esperado "}" para fechar o bloco.');
        return { type: 'Block', declarations, commands };
    }

    declarations() {
        const decls = [];
        while (this.match('INT', 'FLOAT', 'CHAR')) {
            decls.push(this.declaration());
        }
        return decls;
    }

    declaration() {
        const type = this.advance().value;
        const idList = [];
        do {
            const idToken = this.consume('ID', 'Esperado nome da variável.');
            this.addSymbol(idToken.value, type, idToken.line);
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
        if (this.match('FOR')) return this.forStatement();
        if (this.match('DO')) return this.doWhileStatement();
        if (this.match('RETURN')) return this.returnStatement();
        if (this.match('ID')) return this.assignment();
        if (this.match('LBRACE')) return this.block();
        // Permite ponto e vírgula vazio como um comando nulo
        if (this.match('SEMI')) {
            this.advance();
            return { type: 'EmptyStatement' };
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
            this.setInitialized(idToken.value);
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

    forStatement() {
        this.consume('FOR', 'Erro no for.');
        this.consume('LPAREN', 'Esperado "(" após "for".');
        
        this.beginScope(); // Escopo interno do for
        
        let initializer = null;
        if (!this.match('SEMI')) {
            // Permite declaração ou atribuição
            if (this.match('INT', 'FLOAT', 'CHAR')) {
                initializer = this.declaration();
            } else {
                initializer = this.assignment();
            }
        } else {
            this.consume('SEMI', 'Esperado ";" na inicialização do for.');
        }

        let condition = null;
        if (!this.match('SEMI')) {
            condition = this.expression();
        }
        this.consume('SEMI', 'Esperado ";" após a condição do for.');

        let increment = null;
        if (!this.match('RPAREN')) {
            // O incremento é uma expressão, mas sem o ponto e vírgula final
            const idToken = this.consume('ID', 'Expressão de incremento inválida.');
            this.checkDeclaration(idToken.value, idToken.line);
            this.consume('ASSIGN', 'Esperado "=" no incremento do for.');
            const expr = this.expression();
            increment = { type: 'Assignment', variable: idToken.value, value: expr };
        }
        this.consume('RPAREN', 'Esperado ")" após a cláusula do for.');

        const body = this.command();
        this.endScope(); // Fim do escopo do for

        return { type: 'ForStatement', initializer, condition, increment, body };
    }

    doWhileStatement() {
        this.consume('DO', 'Erro no do-while.');
        const body = this.command();
        this.consume('WHILE', 'Esperado "while" após o corpo do do-while.');
        this.consume('LPAREN', 'Esperado "(" após "while".');
        const condition = this.expression();
        this.consume('RPAREN', 'Esperado ")" após a condição.');
        this.consume('SEMI', 'Esperado ";" após o do-while.');
        return { type: 'DoWhileStatement', body, condition };
    }

    returnStatement() {
        const returnToken = this.consume('RETURN', 'Erro no return.');
        let value = null;
        if (!this.match('SEMI')) {
            value = this.expression();
        }
        this.consume('SEMI', 'Esperado ";" após a expressão de retorno.');

        const exprType = value ? value.dataType : 'void';
        if (exprType !== this.currentFunctionReturnType) {
            // Permite retornar int de uma função float
            if (!(this.currentFunctionReturnType === 'float' && exprType === 'int')) {
                 this.addError(`Tipo de retorno incompatível. A função '${this.currentFunctionReturnType}' não pode retornar '${exprType}'.`, returnToken.line);
            }
        }
        
        return { type: 'ReturnStatement', value };
    }

    // --- Parsing de Expressões com Precedência de Operadores ---

    expression() { return this.logic_or(); }
    
    logic_or() {
        let expr = this.logic_and();
        while (this.match('LOGICAL_OR')) {
            const operator = this.advance().type;
            const right = this.logic_and();
            // Em C, operandos lógicos podem ser qualquer número
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: 'int' };
        }
        return expr;
    }

    logic_and() {
        let expr = this.equality();
        while (this.match('LOGICAL_AND')) {
            const operator = this.advance().type;
            const right = this.equality();
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: 'int' };
        }
        return expr;
    }

    equality() {
        let expr = this.comparison();
        while (this.match('EQUALS', 'NE')) {
            const operator = this.advance().type;
            const right = this.comparison();
            this.checkArithmeticType(expr.dataType, right.dataType, operator, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: 'int' }; // Resultado de comparação é 0 ou 1
        }
        return expr;
    }

    comparison() {
        let expr = this.term();
        while (this.match('GT', 'GE', 'LT', 'LE')) {
            const operator = this.advance().type;
            const right = this.term();
            this.checkArithmeticType(expr.dataType, right.dataType, operator, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: 'int' };
        }
        return expr;
    }

    term() {
        let expr = this.factor();
        while (this.match('PLUS', 'MINUS')) {
            const operator = this.advance().type;
            const right = this.factor();
            const resultType = this.checkArithmeticType(expr.dataType, right.dataType, operator, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: resultType };
        }
        return expr;
    }

    factor() {
        let expr = this.unary();
        while (this.match('TIMES', 'DIVIDE', 'MODULO')) {
            const operator = this.advance().type;
            const right = this.unary();
            const resultType = this.checkArithmeticType(expr.dataType, right.dataType, operator, this.peek().line);
            expr = { type: 'BinaryOp', operator, left: expr, right: right, dataType: resultType };
        }
        return expr;
    }

    unary() {
        if (this.match('MINUS', 'LOGICAL_NOT')) {
            const operatorToken = this.advance();
            const operand = this.unary();
            // Unary minus preserva o tipo, ! resulta em int
            const dataType = operatorToken.type === 'LOGICAL_NOT' ? 'int' : operand.dataType;
            return { type: 'UnaryOp', operator: operatorToken.type, operand, dataType };
        }
        return this.primary();
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
        if (this.match('CHAR_LITERAL')) {
            const token = this.advance();
            // Remove as aspas simples
            return { type: 'Literal', value: token.value.slice(1, -1), dataType: 'char' };
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
        const unexpected = this.peek();
        throw new Error(`Expressão inválida na linha ${unexpected.line}. Token inesperado: ${unexpected.value}`);
    }

    /**
     * Ponto de entrada principal para a compilação.
     * @param {string} code - O código fonte a ser compilado.
     */
    analyze(code) {
        this.currentTokenIndex = 0;
        this.scopeChain = [];
        this.semanticErrors = [];
        this.semanticWarnings = [];
        this.ast = null;
        this.currentFunctionReturnType = null;

        this.tokenize(code);
        if (this.semanticErrors.length > 0) return;

        this.parse();
    }
}