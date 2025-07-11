import React from 'react';

const FullScreenSymbolTable = () => {
    const compilerState = JSON.parse(localStorage.getItem('compilerState') || '{}');
    const symbolTable = compilerState.symbolTable || {};

    const handleDownloadSymbolTable = () => {
        const symbolTableJson = JSON.stringify(symbolTable, null, 2);
        const blob = new Blob([symbolTableJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'symbol-table.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="full-screen-container">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tabela de Símbolos</h2>
            <pre className="bg-gray-50 p-4 rounded-md mb-4">
                {Object.keys(symbolTable).length > 0
                    ? JSON.stringify(symbolTable, null, 2)
                    : 'Nenhuma tabela de símbolos disponível. Analise o código na página principal.'}
            </pre>
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleDownloadSymbolTable}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={Object.keys(symbolTable).length === 0}
                >
                    Download Tabela
                </button>
            </div>
        </div>
    );
};

export default FullScreenSymbolTable;