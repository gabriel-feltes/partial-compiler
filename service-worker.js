self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('compiler-pwa-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/src/index.jsx',
                '/src/App.jsx',
                '/src/styles.css',
                '/src/components/CodeEditor.jsx',
                '/src/components/TokensOutput.jsx',
                '/src/components/ASTOutput.jsx',
                '/src/components/SymbolTableOutput.jsx',
                '/src/components/SemanticOutput.jsx',
                '/src/components/FullScreenTokens.jsx',
                '/src/components/FullScreenAST.jsx',
                '/src/components/FullScreenSymbolTable.jsx',
                '/src/utils/Compiler.js',
                '/favicon.ico',
                '/logo192.png',
                '/logo512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});