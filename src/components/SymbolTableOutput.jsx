import React from 'react';
import { Link } from 'react-router-dom';

const SymbolTableOutput = ({ symbolTable }) => {
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
        <div id="symbol-output" className="output-box bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-100 mb-4">4. Tabela de Símbolos</h3>
            <pre className="bg-gray-800 p-4 rounded-md h-48 overflow-y-auto text-gray-200">
                {Object.keys(symbolTable).length > 0
                    ? JSON.stringify(symbolTable, null, 2)
                    : 'Nenhuma tabela de símbolos disponível. Analise o código para gerar a tabela.'}
            </pre>
            <div className="flex justify-end mt-4 space-x-2">
                <button
                    onClick={handleDownloadSymbolTable}
                    className="bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                    disabled={Object.keys(symbolTable).length === 0}
                >
                    Download Tabela
                </button>
                <Link
                    to="/symbol-table"
                    target="_blank"
                    className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                >
                    Tela Cheia
                </Link>
            </div>
        </div>
    );
};

export default SymbolTableOutput;