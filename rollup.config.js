import {readFile} from 'fs/promises';
import {babel} from '@rollup/plugin-babel';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(await readFile('./package.json'));

/**
 * @external RollupConfig
 * @type {object}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {object} config
 * @param {string} config.input
 * @param {boolean} config.minifying
 * @param {string[]} [config."external"]
 * @param {string} [config.environment]
 * @param {string} [config.format]
 * @returns {RollupConfig}
 */
function getRollupObject ({
    input, minifying, environment,
    external,
    format = 'umd'
}) {
    const nonMinified = {
        input,
        external,
        output: {
            format,
            sourcemap: minifying,
            file: `dist/index${environment ? `-${environment}` : ''}-${
                format
            }${minifying ? '.min' : ''}.${
                format === 'esm' ? '' : 'c'
            }js`,
            name: 'JSONPath'
        },
        plugins: [
            babel({
                babelrc: false,
                presets: [
                    environment === 'node' || environment === 'cli'
                        ? ['@babel/preset-env', {
                            targets: [
                                `node ${pkg.engines.node}`
                            ]
                        }]
                        // Can come up with some browser targets
                        : ['@babel/preset-env']
                ],
                babelHelpers: 'bundled'
            }),
            nodeResolve()
        ]
    };
    if (minifying) {
        nonMinified.plugins.push(terser());
    }
    return nonMinified;
}

/**
 * @param {PlainObject} config
 * @param {boolean} config.minifying
 * @param {"node"|"environment"} [config.environment]
 * @returns {RollupConfig[]}
 */
function getRollupObjectByEnv ({minifying, environment}) {
    const input = `src/jsonpath-${environment}.js`;
    if (environment === 'node') {
        const external = ['vm'];
        return [
            getRollupObject({
                input, minifying, environment, external, format: 'cjs'
            }),
            getRollupObject({
                input, minifying, environment, external, format: 'esm'
            })
        ];
    }
    return [
        getRollupObject({input, minifying, environment, format: 'umd'}),
        getRollupObject({input, minifying, environment, format: 'esm'})
    ];
}

export default [
    ...getRollupObjectByEnv({minifying: false, environment: 'node'}),
    // ...getRollupObjectByEnv({minifying: true, environment: 'node'}),
    // getRollupObject({
    //     input: 'bin/jsonpath-cli.js', format: 'esm',
    //     minifying: false, environment: 'cli',
    //     external: ['fs/promises', 'vm']
    // }),
    ...getRollupObjectByEnv({minifying: false, environment: 'browser'}),
    ...getRollupObjectByEnv({minifying: true, environment: 'browser'})
];
