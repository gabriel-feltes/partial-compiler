# Partial Compiler

Este projeto é um compilador parcial desenvolvido como parte de um trabalho acadêmico. Ele possui uma interface web construída com React para facilitar a interação com o usuário.

>[!NOTE]
> Acesse a aplicação publicada em [GitHub Pages](https://gabriel-feltes.github.io/partial-compiler/) e veja o compilador em ação!
> A aplicação permite que você escreva código fonte em C, visualize a árvore sintática abstrata, a tabela de símbolos e os tokens gerados, além de exibir erros semânticos.
> A aplicação é responsiva e funciona bem em dispositivos móveis. Ela permite fazer download da árvore sintática abstrata em formato PNG, bem como da tabela de símbolos e dos tokens em formato JSON.
> O compilador ainda é simples e não possui todas as funcionalidades de um compilador completo, mas já implementa a análise léxica e sintática, além de exibir erros semânticos.

## Estrutura do Sistema

```bash
.
├── package.json                      // Configuração do projeto e dependências
├── package-lock.json
├── postcss.config.js                 // Configuração do PostCSS
├── public
│   ├── favicon.ico
│   ├── index.html                    // Página HTML principal
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json                 // Configuração do manifesto da aplicação web
│   └── robots.txt
├── README.md
├── src
│   ├── App.jsx                       // Página principal da aplicação React
│   ├── App.test.js
│   ├── components
│   │   ├── ASTOutput.jsx             // Exibe a árvore sintática abstrata na página principal
│   │   ├── CodeEditor.jsx            // Editor de código fonte C com suporte a destaque de sintaxe
│   │   ├── FullScreenAST.jsx         // Permite visualizar a árvore sintática abstrata em tela cheia e exportar como PNG
│   │   ├── FullScreenSymbolTable.jsx // Mostra a tabela de símbolos em tela cheia
│   │   ├── FullScreenTokens.jsx      // Mostra os tokens em tela cheia
│   │   ├── SemanticOutput.jsx        // Exibe os erros semânticos na página principal
│   │   ├── SymbolTableOutput.jsx     // Exibe a tabela de símbolos na página principal
│   │   └── TokensOutput.jsx          // Exibe os tokens na página principal
│   ├── index.css
│   ├── index.jsx                     // Ponto de entrada da aplicação React
│   ├── logo.svg
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   ├── styles.css                    // Estilos globais da aplicação e Tailwind CSS
│   └── utils
│       └── Compiler.js               // Implementação do compilador parcial
└── tailwind.config.js                // Configuração do Tailwind CSS
```

## Funcionalidades

- **Editor de Código**: Permite ao usuário digitar ou colar o código fonte.
- **Compilação**: O código é analisado pelo compilador parcial (léxico e sintático).
- **Exibição de Erros**: Mostra mensagens de erro detalhadas caso o código não seja válido.
- **Saída**: Exibe o resultado da compilação ou análise.
- **Interface Intuitiva**: Navegação simples e responsiva.

## Como Rodar o Projeto Localmente

No diretório do projeto, execute:

### `npm install`

Instala as dependências necessárias.

### `npm start`

Roda a aplicação em modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.

### `npm run build`

Gera uma versão otimizada para produção na pasta `build`.

### `npm run deploy`

Faz o deploy da aplicação para o GitHub Pages. Edite o arquivo `package.json` para definir o campo `homepage` com a URL do seu repositório.

## Tecnologias Utilizadas

- React
- JavaScript
- HTML/CSS
- Tailwind CSS

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests. O foco se encontra no script `src/utils/Compiler.js`, onde a lógica do compilador parcial é implementada.
