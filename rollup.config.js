import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

function getRollupObject ({minifying, format = 'umd'} = {}) {
    const nonMinified = {
        input: 'src/jsonpath.js',
        output: {
            format,
            sourcemap: minifying,
            file: `dist/index-${format}${minifying ? '.min' : ''}.js`,
            name: 'JSONPath'
        },
        plugins: [
            babel()
        ]
    };
    if (minifying) {
        nonMinified.plugins.push(terser());
    }
    return nonMinified;
}

export default [
    getRollupObject({minifying: false, format: 'umd'}),
    getRollupObject({minifying: true, format: 'umd'}),
    getRollupObject({minifying: false, format: 'es'}),
    getRollupObject({minifying: true, format: 'es'})
];
