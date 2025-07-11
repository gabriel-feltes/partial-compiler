import React, { useEffect, useRef, useState } from 'react';

const FullScreenSymbolTable = () => {
    const [symbolTable, setSymbolTable] = useState(null);
    const lastSymbolTableRef = useRef(null);

    // Effect for handling storage events
    useEffect(() => {
        let isMounted = true;

        const updateSymbolTable = () => {
            const compilerState = JSON.parse(localStorage.getItem('compilerState') || '{}');
            const newSymbolTable = compilerState.symbolTable || null;
            if (JSON.stringify(newSymbolTable) !== JSON.stringify(lastSymbolTableRef.current)) {
                lastSymbolTableRef.current = newSymbolTable;
                if (isMounted) {
                    setSymbolTable(newSymbolTable);
                }
            }
        };

        // Initial check
        updateSymbolTable();

        // Listen for storage events
        const handleStorageChange = (e) => {
            if (e.key === 'compilerState') {
                updateSymbolTable();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            isMounted = false;
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleDownloadSymbolTable = () => {
        if (!symbolTable) {
            alert('Nenhuma tabela de símbolos disponível para download.');
            return;
        }

        const symbolTableJson = JSON.stringify(symbolTable, null, 2);
        const blob = new Blob([symbolTableJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'symbol-table.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="full-screen-container">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Tabela de Símbolos</h2>
            <pre className="bg-gray-900 p-4 rounded-md mb-4 text-gray-300 font-mono text-sm">
                {symbolTable && Object.keys(symbolTable).length > 0
                    ? JSON.stringify(symbolTable, null, 2)
                    : 'Nenhuma tabela de símbolos disponível. Analise o código na página principal.'}
            </pre>
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleDownloadSymbolTable}
                    className="bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                    disabled={!symbolTable || Object.keys(symbolTable).length === 0}
                >
                    Download Tabela
                </button>
            </div>
        </div>
    );
};

export default FullScreenSymbolTable;