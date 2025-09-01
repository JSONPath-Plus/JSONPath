import ashNazg from 'eslint-config-ash-nazg';

export default [
    {
        ignores: [
            '.github',
            '.idea',
            'dist',
            'docs/ts',
            'coverage',
            'ignore'
        ]
    },
    ...ashNazg(['sauron', 'node', 'browser']),
    {
        settings: {
            polyfills: [
                'document.querySelector'
            ]
        }
    },
    {
        files: ['src/jsonpath-node.js', 'test-helpers/node-env.js'],
        rules: {
            'n/no-unsupported-features/es-syntax': ['error', {
                ignores: [
                    'regexpNamedCaptureGroups', 'modules', 'dynamicImport'
                ]
            }]
        }
    },
    {
        files: ['*.md/*.js', '*.md/*.html'],
        rules: {
            'import/unambiguous': 0,
            'import/no-commonjs': 0,
            'import/no-unresolved': ['error', {
                ignore: ['jsonpath-plus']
            }],
            'sonarjs/no-internal-api-use': 0,
            'no-multiple-empty-lines': ['error', {
                max: 1, maxEOF: 2, maxBOF: 2
            }],
            'no-undef': 0,
            'no-unused-vars': ['error', {
                varsIgnorePattern: 'json|result'
            }],
            'import/no-extraneous-dependencies': 0,
            'n/no-extraneous-import': ['error', {
                allowModules: ['jsonpath-plus']
            }],
            'n/no-missing-require': ['error', {
                allowModules: ['jsonpath-plus']
            }],
            // Unfortunately, with the new processor approach, the filename
            //  is now README.md so our paths must be `../`. However, even
            //  with that, eslint-plugin-node is not friendly to such
            //  imports, so we disable
            'n/no-missing-import': 'off',
            'n/no-unpublished-import': 'off'
        }
    },
    {
        files: ['test/**'],
        languageOptions: {
            globals: {
                assert: 'readonly',
                expect: 'readonly',
                jsonpath: 'readonly'
            }
        },
        rules: {
            '@stylistic/quotes': 0,
            '@stylistic/quote-props': 0,
            'import/unambiguous': 0,
            // Todo: Reenable
            '@stylistic/max-len': 0
        }
    },
    {
        rules: {
            '@stylistic/indent': ['error', 4, {outerIIFEBody: 0}],
            'promise/prefer-await-to-callbacks': 0,

            // Disable for now
            'new-cap': 0,
            'jsdoc/reject-any-type': 0,
            '@stylistic/dot-location': 0,
            // Reenable as have time and confirming no longer needing:
            // https://github.com/babel/babel/issues/8951#issuecomment-508045524
            'prefer-named-capture-group': 0,
            'unicorn/prefer-spread': 0
        }
    }
];
