import React, { useState, useRef } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import TokensOutput from './components/TokensOutput';
import ASTOutput from './components/ASTOutput';
import SymbolTableOutput from './components/SymbolTableOutput';
import SemanticOutput from './components/SemanticOutput';
import FullScreenTokens from './components/FullScreenTokens';
import FullScreenAST from './components/FullScreenAST';
import FullScreenSymbolTable from './components/FullScreenSymbolTable';
import { Compiler } from './utils/Compiler';
import './styles.css';

const App = () => {
  const [compilerState, setCompilerState] = useState({
    tokens: [],
    ast: null,
    symbolTable: {},
    semanticErrors: [],
    semanticWarnings: []
  });
  const editorRef = useRef(null);

  const handleAnalyze = () => {
    const code = editorRef.current.getCode();
    const compiler = new Compiler();
    compiler.analyze(code);
    const newState = {
      tokens: compiler.tokens,
      ast: compiler.ast,
      symbolTable: compiler.symbolTable,
      semanticErrors: compiler.semanticErrors,
      semanticWarnings: compiler.semanticWarnings
    };
    setCompilerState(newState);
    localStorage.setItem('compilerState', JSON.stringify(newState));
    if (ASTOutput.updateAST) {
      ASTOutput.updateAST(newState.ast);
    }
  };

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 min-h-screen flex flex-col">
              <header className="bg-opacity-80 bg-dark-panel shadow-lg border-b border-indigo-700">
                <div className="max-w-5xl mx-auto py-8 px-6 flex flex-col items-center">
                  <h1 className="text-4xl font-extrabold text-indigo-300 tracking-tight drop-shadow-lg">Compilador Didático Interativo</h1>
                  <p className="text-indigo-200 mt-2 text-lg italic">Visualize cada fase do seu compilador em tempo real</p>
                </div>
              </header>
              <main className="max-w-5xl w-full mx-auto py-10 px-4 flex flex-col gap-10">
                <section className="bg-dark-panel/90 p-8 rounded-2xl shadow-2xl border border-indigo-800 mb-6 transition-all hover:shadow-indigo-700">
                  <h2 className="text-2xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-pulse" /> 1. Código Fonte
                  </h2>
                  <CodeEditor ref={editorRef} />
                  <button
                    onClick={handleAnalyze}
                    className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all transform hover:scale-105"
                  >
                    Analisar Código
                  </button>
                </section>
                <section className="bg-dark-panel/90 p-6 rounded-2xl shadow-xl border border-indigo-800 mb-6 transition-all hover:shadow-indigo-700">
                  <TokensOutput tokens={compilerState.tokens} />
                </section>
                <section className="bg-dark-panel/90 p-6 rounded-2xl shadow-xl border border-indigo-800 mb-6 transition-all hover:shadow-indigo-700">
                  <ASTOutput ast={compilerState.ast} />
                </section>
                <section className="bg-dark-panel/90 p-6 rounded-2xl shadow-xl border border-indigo-800 mb-6 transition-all hover:shadow-indigo-700">
                  <SymbolTableOutput symbolTable={compilerState.symbolTable} />
                </section>
                <section className="bg-dark-panel/90 p-6 rounded-2xl shadow-xl border border-indigo-800 transition-all hover:shadow-indigo-700">
                  <SemanticOutput
                    semanticErrors={compilerState.semanticErrors}
                    semanticWarnings={compilerState.semanticWarnings}
                  />
                </section>
              </main>
              <footer className="text-center py-8 text-indigo-300 text-sm border-t border-indigo-800 bg-dark-panel/80">
                <p>
                  DEC0004-09655 (20251) - Compiladores
                </p>
              </footer>
            </div>
          }
        />
        <Route path="/tokens" element={<FullScreenTokens />} />
        <Route path="/ast" element={<FullScreenAST />} />
        <Route path="/symbol-table" element={<FullScreenSymbolTable />} />
      </Routes>
    </HashRouter>
  );
};

export default App;