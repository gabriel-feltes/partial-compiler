import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const CodeEditor = forwardRef((props, ref) => {
    const editorRef = useRef(null);
    const codeMirrorRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getCode: () => codeMirrorRef.current ? codeMirrorRef.current.getValue() : ''
    }));

    useEffect(() => {
        if (!window.CodeMirror) return;

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
            autofocus: true
        });

        const editorElement = editorRef.current; // Copy ref value
        return () => {
            if (editorElement) {
                editorElement.innerHTML = '';
            }
            codeMirrorRef.current = null;
        };
    }, []);

    return <div ref={editorRef} />;
});

export default CodeEditor;