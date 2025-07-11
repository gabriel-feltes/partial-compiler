import React from 'react';
import { Link } from 'react-router-dom';

const TokensOutput = ({ tokens }) => {
    const handleDownloadTokens = () => {
        const tokenText = tokens.map(t => `Linha ${t.line}: ${t.type.padEnd(10, ' ')} -> ${t.value}`).join('\n');
        const blob = new Blob([tokenText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tokens.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div id="lexical-output" className="output-box bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-100 mb-4">2. Análise Léxica (Tokens)</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-md h-48 overflow-y-auto">
                {tokens.length > 0
                    ? tokens.map(t => `Linha ${t.line}: ${t.type.padEnd(10, ' ')} -> ${t.value}`).join('\n')
                    : 'Nenhum token disponível. Analise o código para gerar tokens.'}
            </pre>
            <div className="flex justify-end mt-4 space-x-2">
                <button
                    onClick={handleDownloadTokens}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                    disabled={tokens.length === 0}
                >
                    Download Tokens
                </button>
                <Link
                    to="/tokens"
                    target="_blank"
                    className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                >
                    Tela Cheia
                </Link>
            </div>
        </div>
    );
};

export default TokensOutput;