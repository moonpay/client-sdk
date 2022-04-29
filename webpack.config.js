const path = require('path');

module.exports = {
    mode: 'production',
    devtool: 'inline-source-map',
    entry: './src/client-sdk.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'client-sdk.js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'expose-loader',
                        options: {
                            exposes: ['HyperMint']
                        }
                    },
                    { loader: 'ts-loader' }
                ],
                exclude: /node_modules/
            }
        ]
    }
};
