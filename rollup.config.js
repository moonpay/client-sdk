import nodePolyfills from 'rollup-plugin-polyfill-node';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

export default [
    {
        input: './src/client-sdk-evm.ts',
        output: {
            dir: 'dist',
            format: 'iife',
            sourcemap: false,
            name: 'HyperMint'
        },
        context: 'window',
        plugins: [
            commonjs(),
            nodePolyfills(),
            json(),
            nodeResolve({
                preferBuiltins: true
            }),
            typescript(),
            terser()
        ]
    }
];
