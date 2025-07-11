import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

const ASTOutput = ({ ast: initialAst }) => {
    const visualizationRef = useRef(null);
    const [ast, setAst] = useState(initialAst);

    // Static method to update AST from App.jsx
    ASTOutput.updateAST = (newAst) => {
        setAst(newAst);
    };

    const formatAST = (node, prefix = '', isLast = true) => {
        let result = prefix;
        result += isLast ? '└── ' : '├── ';
        result += node.type;

        if (node.name) result += ` (${node.name})`;
        if (node.value) result += ` = ${node.value}`;
        if (node.operator) result += ` [${node.operator}]`;
        if (node.varType) result += ` <${node.varType}>`;
        result += '\n';

        const children = Object.entries(node)
            .filter(([key, value]) => typeof value === 'object' && value !== null && key !== 'dataType')
            .flatMap(([key, value]) => Array.isArray(value) ? value : [value]);
        
        children.forEach((child, index) => {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            result += formatAST(child, newPrefix, index === children.length - 1);
        });
        return result;
    };

    const astToCytoscapeElements = useCallback((node, parentId = null, id = 0) => {
        const nodeId = `node${id}`;
        let label = node.type
            .replace('Statement', 'Stmt')
            .replace('BinaryOp', 'BinOp')
            .replace('Identifier', 'Id')
            .replace('Declaration', 'Decl')
            .replace('Assignment', 'Assign')
            .replace('Grouping', 'Group');
        if (node.name) label += `: ${node.name}`;
        if (node.value) label += ` = ${node.value}`;
        if (node.operator) label += ` [${node.operator}]`;
        if (node.varType && node.type !== 'Declaration') label += ` <${node.varType}>`;

        const elements = [{
            data: { id: nodeId, label }
        }];
        if (parentId) {
            elements.push({
                data: { id: `edge${parentId}-${nodeId}`, source: parentId, target: nodeId }
            });
        }

        let childId = id + 1;
        const children = Object.entries(node)
            .filter(([key, value]) => typeof value === 'object' && value !== null && key !== 'dataType')
            .flatMap(([key, value]) => Array.isArray(value) ? value : [value]);
        
        children.forEach((child, index) => {
            const childElements = astToCytoscapeElements(child, nodeId, childId);
            elements.push(...childElements);
            childId += childElements.length;
        });

        return elements;
    }, []);

    const handleDownloadAST = () => {
        if (!ast) {
            alert('Nenhuma árvore sintática disponível para download.');
            return;
        }
        const astJson = JSON.stringify(ast, null, 2);
        const blob = new Blob([astJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ast.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        let isMounted = true;
        const currentRef = visualizationRef.current; // Capture ref value at effect run time

        const initializeVisualization = () => {
            if (!ast || !window.cytoscape) {
                if (isMounted && currentRef) {
                    currentRef.innerHTML = '<p class="text-red-600">Não foi possível gerar a visualização devido a erros.</p>';
                }
                return;
            }

            if (isMounted && currentRef) {
                currentRef.innerHTML = ''; // Clear previous content
                const elements = astToCytoscapeElements(ast);
                window.cytoscape({
                    container: currentRef,
                    elements: elements,
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'background-color': '#4a5568',
                                'label': 'data(label)',
                                'text-valign': 'center',
                                'color': '#e2e8f0',
                                'text-outline-width': 1,
                                'text-outline-color': '#4a5568',
                                'shape': 'square',
                                'border-width': 1,
                                'border-color': '#718096',
                                'width': 'label',
                                'height': 'label',
                                'padding': '10px',
                                'font-size': '12px',
                                'font-family': 'Fira Code, monospace',
                                'text-wrap': 'wrap',
                                'text-max-width': 'auto',
                                'text-max-height': 'auto'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'width': 1.5,
                                'line-color': '#a0aec0',
                                'target-arrow-color': '#a0aec0',
                                'target-arrow-shape': 'triangle',
                                'curve-style': 'bezier'
                            }
                        }
                    ],
                    layout: {
                        name: 'breadthfirst',
                        directed: true,
                        padding: 15,
                        spacingFactor: 1.5
                    }
                });
            }
        };

        // Delay slightly to ensure state update propagates
        const timer = setTimeout(initializeVisualization, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (currentRef) {
                currentRef.innerHTML = ''; // Cleanup on unmount
            }
        };
    }, [ast, astToCytoscapeElements]);

    return (
        <div id="syntax-output" className="output-box bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-200 mb-4">3. Análise Sintática (Árvore Sintática)</h3>
            <pre id="astResult" className="bg-gray-900 p-4 rounded-md h-48 overflow-y-auto text-gray-300">
                {ast ? formatAST(ast) : "Não foi possível gerar a árvore sintática devido a erros."}
            </pre>
            <div id="ast-visualization" ref={visualizationRef}></div>
            <div className="flex justify-end mt-4 space-x-2">
                <button
                    onClick={handleDownloadAST}
                    className="bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                    disabled={!ast}
                >
                    Download AST
                </button>
                <Link
                    to="/ast"
                    target="_blank"
                    className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                >
                    Tela Cheia
                </Link>
            </div>
        </div>
    );
};

export default ASTOutput;