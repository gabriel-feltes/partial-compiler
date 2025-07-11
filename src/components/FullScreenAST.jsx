import React, { useEffect, useRef, useCallback, useState } from 'react';

const FullScreenAST = () => {
    const visualizationRef = useRef(null);
    const [ast, setAst] = useState(null);
    const lastAstRef = useRef(null); // Track the last ast value to avoid unnecessary updates
    const cyRef = useRef(null); // Store the Cytoscape instance

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
        if (!cyRef.current || !ast) {
            alert('Nenhuma visualização disponível para download.');
            return;
        }

        // Export as high-resolution PNG
        const pngDataUrl = cyRef.current.png({ scale: 3, full: true });
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = 'ast_graph.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Effect for initialization and rendering the visualization
    useEffect(() => {
        let isMounted = true;
        const currentRef = visualizationRef.current; // Capture ref value at effect run time

        const loadCytoscape = () => {
            return new Promise((resolve, reject) => {
                if (window.cytoscape) {
                    resolve();
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.19.0/cytoscape.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                }
            });
        };

        const initializeVisualization = async () => {
            try {
                await loadCytoscape();
                if (!ast || !window.cytoscape) {
                    console.log('Debug - initializeVisualization:', { ast, windowCytoscape: window.cytoscape });
                    if (isMounted && currentRef) {
                        currentRef.innerHTML = '<p class="text-red-600">Não foi possível gerar a visualização devido a erros.</p>';
                    }
                    return;
                }

                if (isMounted && currentRef) {
                    currentRef.innerHTML = ''; // Clear previous content
                    const elements = astToCytoscapeElements(ast);
                    const cy = window.cytoscape({
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
                    cyRef.current = cy; // Store the Cytoscape instance
                }
            } catch (error) {
                console.error('Error loading Cytoscape or initializing visualization:', error);
                if (isMounted && currentRef) {
                    currentRef.innerHTML = '<p class="text-red-600">Erro ao gerar a visualização. Verifique o console.</p>';
                }
            }
        };

        initializeVisualization();

        return () => {
            isMounted = false;
            if (currentRef) {
                currentRef.innerHTML = ''; // Use captured ref in cleanup
            }
            if (cyRef.current) {
                cyRef.current.destroy(); // Cleanup Cytoscape instance
            }
        };
    }, [ast, astToCytoscapeElements]); // Include ast to re-render when it changes

    // Effect for handling storage events
    useEffect(() => {
        let isMounted = true;
        const updateVisualization = () => {
            const compilerState = JSON.parse(localStorage.getItem('compilerState') || '{}');
            console.log('Debug - updateVisualization:', { compilerState });
            const newAst = compilerState.ast || null;
            if (newAst !== lastAstRef.current) {
                lastAstRef.current = newAst;
                if (isMounted) {
                    setAst(newAst);
                }
            }
        };

        // Initial check
        updateVisualization();

        // Listen for storage events (e.g., when localStorage changes in another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'compilerState') {
                updateVisualization();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            isMounted = false;
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // No dependencies to avoid re-running on state changes

    return (
        <div className="full-screen-container">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Análise Sintática (Árvore Sintática)</h2>
            <pre className="bg-gray-900 p-4 rounded-md mb-4 text-gray-300">
                {ast ? formatAST(ast) : "Não foi possível gerar a árvore sintática devido a erros."}
            </pre>
            <div id="ast-visualization" ref={visualizationRef}></div>
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleDownloadAST}
                    className="bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                    disabled={!ast}
                >
                    Download AST
                </button>
            </div>
        </div>
    );
};

export default FullScreenAST;