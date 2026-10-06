import structuredCloningTypes from '../src/structuredCloningTypes.js';

describe('JSONPath - structuredCloningTypes', function () {
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
            customTypes: structuredCloningTypes
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
            customTypes: structuredCloningTypes
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
            customTypes: structuredCloningTypes
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
            customTypes: structuredCloningTypes
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
            customTypes: structuredCloningTypes
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
            customTypes: structuredCloningTypes,
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
            customTypes: structuredCloningTypes,
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
            customTypes: structuredCloningTypes,
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
            customTypes: structuredCloningTypes,
            json: jsonMixed, path: '$..*@NaN()'
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
            customTypes: structuredCloningTypes,
            json: jsonMixed, path: '$..*@BigIntObject()'
        });
        assert.deepEqual(result, expected);
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
            customTypes: structuredCloningTypes
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
            customTypes: structuredCloningTypes
        });
        assert.deepEqual(result, expected);
    });
});

