import React from 'react';

const SemanticOutput = ({ semanticErrors, semanticWarnings }) => {
    return (
        <div id="semantic-output" className="output-box bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-100 mb-4">5. Análise Semântica (Resultados)</h3>
            <div id="semanticResult" className="space-y-2">
                {semanticErrors.length === 0 && semanticWarnings.length === 0 ? (
                    <div className="text-green-400 bg-green-900/30 p-3 rounded-md">
                        Nenhum erro ou aviso semântico encontrado. Código válido!
                    </div>
                ) : (
                    <>
                        {semanticErrors.map((err, index) => (
                            <p key={index} className="text-red-400 bg-red-900/30 p-3 rounded-md">{err}</p>
                        ))}
                        {semanticWarnings.map((warn, index) => (
                            <p key={index} className="text-yellow-400 bg-yellow-900/30 p-3 rounded-md">{warn}</p>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default SemanticOutput;