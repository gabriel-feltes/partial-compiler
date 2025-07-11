import React from 'react';

const FullScreenTokens = () => {
    const compilerState = JSON.parse(localStorage.getItem('compilerState') || '{}');
    const tokens = compilerState.tokens || [];

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
        <div className="full-screen-container">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Análise Léxica (Tokens)</h2>
            <pre className="bg-gray-50 p-4 rounded-md mb-4">
                {tokens.length > 0
                    ? tokens.map(t => `Linha ${t.line}: ${t.type.padEnd(10, ' ')} -> ${t.value}`).join('\n')
                    : 'Nenhum token disponível. Analise o código na página principal.'}
            </pre>
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleDownloadTokens}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={tokens.length === 0}
                >
                    Download Tokens
                </button>
            </div>
        </div>
    );
};

export default FullScreenTokens;