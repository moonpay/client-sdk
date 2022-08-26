/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const mix = require('laravel-mix');

mix.ts('src/client-sdk-evm.ts', 'dist')
    .ts('src/client-sdk-solana.ts', 'dist')
    .setPublicPath('dist')
    .webpackConfig({
        resolve: {
            extensions: ['.ts'],
            fallback: {
                stream: require.resolve('stream-browserify'),
                crypto: require.resolve('crypto-browserify'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify/browser')
            }
        },
        output: {
            library: {
                name: 'HyperMint',
                type: 'window'
            }
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                }
            ]
        }
    });
