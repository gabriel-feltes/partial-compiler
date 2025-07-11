import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';

const CodeEditor = forwardRef((props, ref) => {
    const editorRef = useRef(null);
    const codeMirrorRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
        getCode: () => codeMirrorRef.current ? codeMirrorRef.current.getValue() : '',
        focus: () => codeMirrorRef.current?.focus()
    }));

    useEffect(() => {
        // Carrega o CodeMirror de forma assíncrona
        const loadCodeMirror = async () => {
            if (typeof window === 'undefined') return; // Não executa no SSR
            
            // Verifica se já está carregado
            if (window.CodeMirror) {
                setIsLoaded(true);
                return;
            }

            // Carrega os recursos necessários
            try {
                await Promise.all([
                    // Carrega o CSS
                    new Promise((resolve) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css';
                        link.onload = resolve;
                        document.head.appendChild(link);
                    }),
                    // Carrega o tema
                    new Promise((resolve) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css';
                        link.onload = resolve;
                        document.head.appendChild(link);
                    }),
                    // Carrega o script principal
                    new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js';
                        script.onload = resolve;
                        document.body.appendChild(script);
                    }),
                    // Carrega o modo C
                    new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/clike/clike.min.js';
                        script.onload = resolve;
                        document.body.appendChild(script);
                    })
                ]);
                
                setIsLoaded(true);
            } catch (error) {
                console.error('Erro ao carregar CodeMirror:', error);
            }
        };

        loadCodeMirror();

        return () => {
            // Limpeza
            if (codeMirrorRef.current) {
                const editorElement = editorRef.current;
                if (editorElement) {
                    editorElement.innerHTML = '';
                }
                codeMirrorRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !window.CodeMirror || !editorRef.current) return;

        // Inicializa o editor
        codeMirrorRef.current = window.CodeMirror(editorRef.current, {
            value: `int main() {
    int a, b;
    float resultado;
    
    a = 10;
    b = 2;
    
    if (a > 5) {
        resultado = a * b;
    } else {
        resultado = a / b;
    }
}`,
            mode: 'text/x-csrc',
            theme: 'monokai',
            lineNumbers: true,
            lineWrapping: true,
            tabSize: 4,
            indentWithTabs: true,
            autofocus: true,
            extraKeys: {
                'Tab': 'indentMore',
                'Shift-Tab': 'indentLess'
            }
        });

        // Adiciona classe para estilização
        const wrapper = editorRef.current.querySelector('.CodeMirror');
        if (wrapper) {
            wrapper.style.height = '100%';
            wrapper.style.minHeight = '300px';
            wrapper.classList.add('rounded-md');
            wrapper.classList.add('overflow-hidden');
        }

    }, [isLoaded]);

    return (
        <div className="h-full">
            {!isLoaded && (
                <div className="bg-gray-800 text-gray-300 p-4 rounded-md h-[300px] flex items-center justify-center">
                    Carregando editor...
                </div>
            )}
            <div ref={editorRef} className={isLoaded ? 'h-full' : 'hidden'} />
        </div>
    );
});

export default CodeEditor;