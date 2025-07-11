const path = require('path');

module.exports = {
    entry: './src/index.jsx',
    output: {
        path: path.resolve(__dirname, 'public/static/js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
            'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom')
        }
    },
    mode: 'development'
};