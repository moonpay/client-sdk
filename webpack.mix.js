/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const mix = require('laravel-mix');

// TODO: need to use mix.ts here to get proper typescript build checks
mix.js('src/client-sdk-evm.ts', 'dist')
    .js('src/client-sdk-solana.ts', 'dist')
    .copyDirectory('./dist', './src/example/dist')
    .setPublicPath('dist')
    .webpackConfig({
        // TODO: move to custom config file
        resolve: {
            extensions: ['.ts'],
            fallback: {
                stream: require.resolve('stream-browserify'),
                crypto: require.resolve('crypto-browserify'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify/browser'),
                util: require.resolve('util/')
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
