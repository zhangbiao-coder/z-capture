import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/z-capture.umd.js',
            format: 'umd',
            name: 'z-capture'
        }, {
            file: 'dist/z-capture.umd.min.js',
            format: 'umd',
            name: 'z-capture',
            sourcemap: true,
            plugins: [terser()]
        }
    ],
    plugins: [
        typescript(),
        commonjs()
    ]
}