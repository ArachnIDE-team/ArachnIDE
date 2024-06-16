// vite.config.js
import typescript from '@rollup/plugin-typescript';

export default {
    base: './',
    plugins: [
        typescript({
            /* TypeScript options here */
        })
    ],
    build: {
        sourcemap: 'inline',
        target: 'esnext',
        minify: false
    },
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment'
    },
    server: {
        port: 8080,
        // host: true // We tried mobile, it's not easy to keep it compatible.
        // Maybe later we can add gestures and touch events, but for code execution I don't know
    }
};