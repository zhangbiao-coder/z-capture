import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/esm2015/z-capture.mjs',
            format: 'esm',
            name: 'ZCapture',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript({tsconfig: 'tsconfig.es2015.json'}),
        commonjs()
    ]
}