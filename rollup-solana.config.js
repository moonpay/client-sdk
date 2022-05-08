import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: './src/client-sdk-solana.ts',
    output: {
        dir: 'dist',
        format: 'iife',
        sourcemap: false,
        name: 'HyperMint'
    },
    context: 'window',
    plugins: [
        nodeResolve({
            preferBuiltins: false,
            browser: true
        }),
        typescript(),
        commonjs(),
        terser()
    ]
};
