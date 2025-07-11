import React, { useEffect, useRef, useState } from 'react';

const FullScreenTokens = () => {
    const [tokens, setTokens] = useState(null);
    const lastTokensRef = useRef(null);

    // Effect for handling storage events
    useEffect(() => {
        let isMounted = true;

        const updateTokens = () => {
            const compilerState = JSON.parse(localStorage.getItem('compilerState') || '{}');
            const newTokens = compilerState.tokens || null;
            if (JSON.stringify(newTokens) !== JSON.stringify(lastTokensRef.current)) {
                lastTokensRef.current = newTokens;
                if (isMounted) {
                    setTokens(newTokens);
                }
            }
        };

        // Initial check
        updateTokens();

        // Listen for storage events
        const handleStorageChange = (e) => {
            if (e.key === 'compilerState') {
                updateTokens();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            isMounted = false;
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleDownloadTokens = () => {
        if (!tokens || tokens.length === 0) {
            alert('Nenhum token disponível para download.');
            return;
        }

        const tokenText = tokens.map(t => `Linha ${t.line}: ${t.type.padEnd(10, ' ')} -> ${t.value}`).join('\n');
        const blob = new Blob([tokenText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tokens.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="full-screen-container">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Análise Léxica (Tokens)</h2>
            <pre className="bg-gray-900 p-4 rounded-md mb-4 text-gray-300 font-mono text-sm">
                {tokens && tokens.length > 0
                    ? tokens.map(t => `Linha ${t.line}: ${t.type.padEnd(10, ' ')} -> ${t.value}`).join('\n')
                    : 'Nenhum token disponível. Analise o código na página principal.'}
            </pre>
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleDownloadTokens}
                    className="bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                    disabled={!tokens || tokens.length === 0}
                >
                    Download Tokens
                </button>
            </div>
        </div>
    );
};

export default FullScreenTokens;