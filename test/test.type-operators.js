/**
 * @import {OtherTypeCallback} from '../src/jsonpath.js';
 */
describe('JSONPath - Type Operators', function () {
    // tests based on examples at https://goessner.net/articles/jsonpath/

    const json = {"store": {
        "book": [
            {
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
                "price": [8.95, 8.94, 8.93]
            },
            {
                "category": "fiction",
                "author": "Evelyn Waugh",
                "title": "Sword of Honour",
                "price": 12.99
            },
            {
                "category": "fiction",
                "author": "Herman Melville",
                "title": "Moby Dick",
                "isbn": "0-553-21311-3",
                "price": 8.99
            },
            {
                "category": "fiction",
                "author": "J. R. R. Tolkien",
                "title": "The Lord of the Rings",
                "isbn": "0-395-19395-8",
                "price": 22.99
            }
        ],
        "bicycle": {
            "color": "red",
            "price": 19.95
        }
    }};

    it('@number()', () => {
        const expected = [8.95, 8.94, 8.93, 12.99, 8.99, 22.99];
        const result = jsonpath({json, path: '$.store.book..*@number()', flatten: true});
        assert.deepEqual(result, expected);
    });

    it('@scalar()', () => {
        const expected = ["red", 19.95];
        const result = jsonpath({json, path: '$.store.bicycle..*@scalar()', flatten: true});
        assert.deepEqual(result, expected);
    });

    it('@scalar() get falsey and avoid objects', () => {
        const jsonMixed = {
            nested: {
                a: 5,
                b: {},
                c: null,
                d: 'abc'
            }
        };
        const expected = [
            jsonMixed.nested.a, jsonMixed.nested.c, jsonMixed.nested.d
        ];
        const result = jsonpath({json: jsonMixed, path: '$..*@scalar()'});
        assert.deepEqual(result, expected);
    });

    it('@other()', () => {
        const expected = [12.99, 8.99, 22.99];

        /**
         *
         * @type {OtherTypeCallback}
         */
        function endsIn99 (val /* , path, parent, parentPropName */) {
            return (/\.99/v).test(String(val));
        }
        const result = jsonpath({json, path: '$.store.book..*@other()', flatten: true, otherTypeCallback: endsIn99});
        assert.deepEqual(result, expected);
    });

    it('throw with `@other` and no `otherTypeCallback`', function () {
        expect(() => {
            jsonpath({
                json: {a: new Date()}, path: '$..*@other()'
            });
        }).to.throw(
            TypeError,
            'You must supply an otherTypeCallback callback option ' +
            'with the @other() operator.'
        );
    });

    it('@object()', () => {
        const jsonMixed = {
            nested: {
                a: true,
                b: null,
                c: {
                    d: 7
                }
            }
        };
        const expected = [jsonMixed.nested, jsonMixed.nested.c];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@object()', flatten: true
        });
        assert.deepEqual(result, expected);
    });

    it('@array()', () => {
        const jsonMixed = {
            nested: {
                a: [3, 4, 5],
                b: null,
                c: [
                    7, [8, 9]
                ]
            }
        };
        const expected = [
            jsonMixed.nested.a, jsonMixed.nested.c, jsonMixed.nested.c[1]
        ];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@array()'
        });
        assert.deepEqual(result, expected);
    });

    it('@boolean()', () => {
        const jsonMixed = {
            nested: {
                a: true,
                b: null,
                c: /** @type {[number, unknown[]]} */ ([
                    7, [false, 9]
                ])
            }
        };
        const expected = [jsonMixed.nested.a, jsonMixed.nested.c[1][0]];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@boolean()', flatten: true
        });
        assert.deepEqual(result, expected);
    });

    it('@integer()', () => {
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: null,
                c: /** @type {[number, unknown[]]} */ ([
                    42, [false, 73]
                ])
            }
        };
        const expected = [jsonMixed.nested.c[0], jsonMixed.nested.c[1][1]];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@integer()', flatten: true
        });
        assert.deepEqual(result, expected);
    });

    it('@nonFinite()', () => {
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: -Infinity,
                c: /** @type {[number, unknown[]]} */ ([
                    42, [Infinity, 73, NaN]
                ])
            }
        };
        const expected = [
            jsonMixed.nested.b, jsonMixed.nested.c[1][0], jsonMixed.nested.c[1][2]
        ];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@nonFinite()'
        });
        assert.deepEqual(result, expected);
    });

    it('@null()', () => {
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: null,
                c: [
                    42, [false, 73]
                ]
            }
        };
        const expected = [null];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@null()'
        });
        assert.deepEqual(result, expected);
    });

    it('@symbol()', () => {
        const sym = Symbol('abc');
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: sym,
                c: [
                    42, [false, 73]
                ]
            }
        };
        const expected = [sym];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@symbol()'
        });
        assert.deepEqual(result, expected);
    });

    it('@Promise()', () => {
        const prom = Promise.resolve();
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: prom,
                c: [
                    42, [false, 73]
                ]
            }
        };
        const expected = [prom];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@Promise()'
        });
        assert.deepEqual(result, expected);
    });

    it('@jsonReference()', () => {
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: {
                    $ref: 'https://example.com/some/path'
                },
                c: [
                    42, [false, 73]
                ]
            }
        };
        const expected = [{$ref: 'https://example.com/some/path'}];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@jsonReference()'
        });
        assert.deepEqual(result, expected);
    });

    it('unwraps a lone type-operator result with `wrap: false`', () => {
        const result = jsonpath({
            json: {a: 1}, path: '$..*[@number()]', wrap: false
        });
        assert.deepEqual(result, 1);
    });

    it('still wraps multiple type-operator results with `wrap: false`', () => {
        const result = jsonpath({
            json: {a: 1, b: 2}, path: '$..*[@number()]', wrap: false
        });
        assert.deepEqual(result, [1, 2]);
    });

    it('adds no `hasArrExpr` key to `resultType: "all"` results', () => {
        const jsonSimple = {a: 1};
        const result = /** @type {object[]} */ (jsonpath({
            json: jsonSimple, path: '$..*[@number()]', resultType: 'all'
        }));
        assert.deepEqual(Object.keys(result[0]), [
            'path', 'value', 'parent', 'parentProperty', 'pointer'
        ]);
        assert.deepEqual(result, [{
            path: "$['a']",
            value: 1,
            parent: jsonSimple,
            parentProperty: 'a',
            pointer: '/a'
        }]);
    });

    describe('customTypes', () => {
        it('allows custom type operators', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'])
                : {[Symbol.toStringTag]: 'Blob'};
            const jsonMixed = {
                nested: {
                    a: blobObj,
                    b: null,
                    c: {
                        d: 7
                    }
                }
            };
            const expected = [blobObj];

            const result = jsonpath({
                json: jsonMixed,
                path: '$..*@Blob()',
                flatten: true,
                customTypes: {
                    Blob: (/** @type {any} */ val) => Object.prototype.toString.call(val) === '[object Blob]'
                }
            });
            assert.deepEqual(result, expected);
        });

        it('allows custom structured cloning type operators', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'])
                : {[Symbol.toStringTag]: 'Blob'};
            const jsonMixed = {
                nested: {
                    a: blobObj,
                    b: null,
                    c: {
                        d: 7
                    }
                }
            };
            const expected = [blobObj];

            const result = jsonpath({
                json: jsonMixed,
                path: '$..*@Blob()',
                flatten: true,
                customTypes: 'structuredCloning'
            });
            assert.deepEqual(result, expected);
        });

        it('allows custom type operators via evaluate method', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'])
                : {[Symbol.toStringTag]: 'Blob'};
            const jsonMixed = {a: blobObj};
            const expected = [blobObj];
            const jp = jsonpath({autostart: false});
            const result = jp.evaluate({
                json: jsonMixed,
                path: '$..*@Blob()',
                flatten: true,
                customTypes: {
                    Blob: (val) => Object.prototype.toString.call(val) === '[object Blob]'
                }
            });
            assert.deepEqual(result, expected);
        });

        it('allows custom structured cloning type operators via evaluate method', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'])
                : {[Symbol.toStringTag]: 'Blob'};
            const jsonMixed = {a: blobObj};
            const expected = [blobObj];
            const jp = jsonpath({autostart: false});
            const result = jp.evaluate({
                json: jsonMixed,
                path: '$..*@Blob()',
                flatten: true,
                customTypes: 'structuredCloning'
            });
            assert.deepEqual(result, expected);
        });

        [
            Date,
            Set,
            Map,
            RegExp,
            DOMException,
            Error,
            QuotaExceededError,
            ArrayBuffer,
            DataView,
            Int8Array,
            Uint8Array,
            Uint8ClampedArray,
            Int16Array,
            Uint16Array,
            Int32Array,
            Uint32Array,
            Float32Array,
            Float64Array,
            BigInt64Array,
            BigUint64Array,
            Float16Array,
            Boolean,
            Number,
            String,
            {name: 'CryptoKey'},
            {name: 'WebTransportError'},
            {name: 'FileList'},
            {name: 'ImageData'},
            {name: 'ImageBitmap'},
            {name: 'DOMMatrix'},
            {name: 'DOMMatrixReadOnly'},
            {name: 'DOMPoint'},
            {name: 'DOMPointReadOnly'},
            {name: 'DOMRect'},
            {name: 'DOMRectReadOnly'},
            {name: 'DOMQuad'},
            {name: 'AudioData'},
            {name: 'EncodedAudioChunk'},
            {name: 'EncodedVideoChunk'},
            {name: 'VideoFrame'},
            {name: 'CropTarget'},
            {name: 'FileSystemDirectoryHandle'},
            {name: 'FileSystemFileHandle'},
            {name: 'GPUCompilationInfo'},
            {name: 'GPUCompilationMessage'},
            {name: 'GPUPipelineError'},
            {name: 'RTCCertificate'},
            {name: 'RTCEncodedAudioFrame'},
            {name: 'RTCEncodedVideoFrame'}
        ].forEach((Ctor) => {
            const obj = {[Symbol.toStringTag]: Ctor.name};
            const jsonMixed = {a: obj};
            const expected = [obj];
            const jp = jsonpath({autostart: false});
            const result = jp.evaluate({
                json: jsonMixed,
                path: '$..*@' + Ctor.name + '()',
                flatten: true,
                customTypes: 'structuredCloning'
            });
            assert.deepEqual(result, expected);
        });

        [
            EvalError,
            RangeError,
            ReferenceError,
            SyntaxError,
            TypeError,
            URIError
        ].forEach((Ctor) => {
            const obj = new Ctor();
            const jsonMixed = {a: obj};
            const expected = [obj];
            const jp = jsonpath({autostart: false});
            const result = jp.evaluate({
                json: jsonMixed,
                path: '$..*@' + Ctor.name + '()',
                flatten: true,
                customTypes: 'structuredCloning'
            });
            assert.deepEqual(result, expected);
        });

        it('AggregateError', () => {
            const obj = new AggregateError([
                new Error('abc'), new Error('def')
            ], 'msg');
            const jsonMixed = {a: obj};
            const expected = [obj];
            const jp = jsonpath({autostart: false});
            const result = jp.evaluate({
                json: jsonMixed,
                path: '$..*@AggregateError()',
                flatten: true,
                customTypes: 'structuredCloning'
            });
            assert.deepEqual(result, expected);
        });

        it('structured cloning @Infinity()', () => {
            const jsonMixed = {
                nested: {
                    a: 50.7,
                    b: Infinity,
                    c: [
                        42, [false, 73]
                    ]
                }
            };
            const expected = [Infinity];
            const result = jsonpath({
                customTypes: 'structuredCloning',
                json: jsonMixed, path: '$..*@Infinity()'
            });
            assert.deepEqual(result, expected);
        });

        it('structured cloning @negativeInfinity()', () => {
            const jsonMixed = {
                nested: {
                    a: 50.7,
                    b: -Infinity,
                    c: [
                        42, [false, 73]
                    ]
                }
            };
            const expected = [-Infinity];
            const result = jsonpath({
                customTypes: 'structuredCloning',
                json: jsonMixed, path: '$..*@negativeInfinity()'
            });
            assert.deepEqual(result, expected);
        });

        it('structured cloning @negativeZero()', () => {
            const jsonMixed = {
                nested: {
                    a: 50.7,
                    b: -0,
                    c: [
                        42, [false, 73]
                    ]
                }
            };
            const expected = [-0];
            const result = jsonpath({
                customTypes: 'structuredCloning',
                json: jsonMixed, path: '$..*@negativeZero()'
            });
            assert.deepEqual(result, expected);
        });

        it('structured cloning @NaN()', () => {
            const jsonMixed = {
                nested: {
                    a: 50.7,
                    b: NaN,
                    c: [
                        42, [false, 73]
                    ]
                }
            };
            const expected = [NaN];
            const result = jsonpath({
                customTypes: 'structuredCloning',
                json: jsonMixed, path: '$..*@NaN()'
            });
            assert.deepEqual(result, expected);
        });

        it('structured cloning @BigInt()', () => {
            const jsonMixed = {
                nested: {
                    a: 50.7,
                    b: 1234n,
                    c: [
                        42, [false, 73]
                    ]
                }
            };
            const expected = [1234n];
            const result = jsonpath({
                customTypes: 'structuredCloning',
                json: jsonMixed, path: '$..*@BigInt()'
            });
            assert.deepEqual(result, expected);
        });

        it('structured cloning @BigIntObject()', () => {
            const jsonMixed = {
                nested: {
                    a: 50.7,
                    b: new Object(1234n),
                    c: [
                        42, [false, 73]
                    ]
                }
            };
            const expected = [new Object(1234n)];
            const result = jsonpath({
                customTypes: 'structuredCloning',
                json: jsonMixed, path: '$..*@BigIntObject()'
            });
            assert.deepEqual(result, expected);
        });

        it('throws on unregistered custom type operator', () => {
            expect(() => {
                jsonpath({
                    json: {a: 1},
                    path: '$..*@unregisteredType()',
                    flatten: true,
                    customTypes: {
                        Blob: (val) => Object.prototype.toString.call(val) === '[object Blob]'
                    }
                });
            }).to.throw(TypeError, 'Unknown value type unregisteredType');
        });

        it('allows custom type operators with arguments', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'], {
                    type: 'text/plain'
                })
                : {[Symbol.toStringTag]: 'Blob', type: 'text/plain'};
            const jsonMixed = {
                nested: {
                    a: blobObj,
                    b: null,
                    c: {
                        d: 7
                    }
                }
            };
            const expected = [blobObj];

            const result = jsonpath({
                json: jsonMixed,
                path: '$..*@Blob("text/plain")',
                flatten: true,
                customTypes: {
                    Blob (val, _1, _2, _3, arg) {
                        if (!val) {
                            return false;
                        }
                        return Object.prototype.toString.call(val) === '[object Blob]' &&
                            Boolean(val) && typeof val === 'object' &&
                            'type' in (
                                /** @type {object} */ (val)
                            ) && /** @type {{type?: string}} */ (val).type === arg;
                    }
                }
            });
            assert.deepEqual(result, expected);
        });

        it('allows custom structured cloning type operators with arguments', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'], {
                    type: 'text/plain'
                })
                : {[Symbol.toStringTag]: 'Blob', type: 'text/plain'};
            const jsonMixed = {
                nested: {
                    a: blobObj,
                    b: null,
                    c: {
                        d: 7
                    }
                }
            };
            const expected = [blobObj];

            const result = jsonpath({
                json: jsonMixed,
                path: '$..*@Blob("text/plain")',
                flatten: true,
                customTypes: 'structuredCloning'
            });
            assert.deepEqual(result, expected);
        });

        it('allows custom structured cloning type operators with arguments (File)', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const fileObj = typeof File !== 'undefined'
                ? new File(['test'], 'fileName', {
                    type: 'text/plain'
                })
                : {[Symbol.toStringTag]: 'File', type: 'text/plain'};
            const jsonMixed = {
                nested: {
                    a: fileObj,
                    b: null,
                    c: {
                        d: 7
                    }
                }
            };
            const expected = [fileObj];

            const result = jsonpath({
                json: jsonMixed,
                path: '$..*@File("text/plain")',
                flatten: true,
                customTypes: 'structuredCloning'
            });
            assert.deepEqual(result, expected);
        });
    });
});
