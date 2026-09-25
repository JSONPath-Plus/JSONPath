/**
 * @param {unknown} val
 */
export const toStringTag = (val) => {
    return Object.prototype.toString.call(val).slice(8, -1);
};

/**
 * @param {unknown} a
 * @param {unknown} b
 */
export const hasConstructor = (a, b) => {
    return Function.prototype.toString.call(
        Object.getPrototypeOf(a).constructor
    ) === Function.prototype.toString.call(
        b
    );
};

export const structuredCloningCustomTypes = {
    /**
     * @param {unknown} val
     */
    NaN (val) {
        return Number.isNaN(val);
    },
    /**
     * @param {unknown} val
     */
    BigInt (val) {
        return typeof val === 'bigint';
    },
    /**
     * @param {unknown} val
     */
    BigIntObject (val) {
        return Boolean(val) && typeof val === 'object' &&
            toStringTag(Object.getPrototypeOf(val)) === 'BigInt';
    },
    /**
     * @param {unknown} val
     */
    Date (val) {
        return toStringTag(val) === 'Date';
    },
    /**
     * @param {unknown} val
     */
    Set (val) {
        return toStringTag(val) === 'Set';
    },
    /**
     * @param {unknown} val
     */
    Map (val) {
        return toStringTag(val) === 'Map';
    },
    /**
     * @param {unknown} val
     */
    RegExp (val) {
        return toStringTag(val) === 'RegExp';
    },
    /**
     * @param {unknown} val
     * @param {unknown} _path
     * @param {unknown} _parent
     * @param {string|number|null} _parentPropName
     * @param {string} arg
     */
    Blob (val, _path, _parent, _parentPropName, arg) {
        return toStringTag(val) === 'Blob' &&
            (!arg || arg === /** @type {Blob} */ (val).type);
    },
    /**
     * @param {unknown} val
     */
    Boolean (val) {
        return toStringTag(val) === 'Boolean' && typeof val === 'object';
    },
    /**
     * @param {unknown} val
     */
    Number (val) {
        return toStringTag(val) === 'Number' && typeof val === 'object';
    },
    /**
     * @param {unknown} val
     */
    String (val) {
        return toStringTag(val) === 'String' && typeof val === 'object';
    },
    /**
     * @param {unknown} val
     */
    Infinity (val) {
        return val === Infinity;
    },
    /**
     * @param {unknown} val
     */
    negativeInfinity (val) {
        return val === -Infinity;
    },
    /**
     * @param {unknown} val
     */
    negativeZero (val) {
        return Object.is(val, -0);
    },
    /**
     * @param {unknown} val
     */
    DOMException (val) {
        return toStringTag(val) === 'DOMException';
    },
    /**
     * @param {unknown} val
     */
    Error (val) {
        return toStringTag(val) === 'Error';
    },
    /**
     * @param {unknown} val
     */
    EvalError (val) {
        return hasConstructor(val, EvalError);
    },
    /**
     * @param {unknown} val
     */
    RangeError (val) {
        return hasConstructor(val, RangeError);
    },
    /**
     * @param {unknown} val
     */
    ReferenceError (val) {
        return hasConstructor(val, ReferenceError);
    },
    /**
     * @param {unknown} val
     */
    SyntaxError (val) {
        return hasConstructor(val, SyntaxError);
    },
    /**
     * @param {unknown} val
     */
    TypeError (val) {
        return hasConstructor(val, TypeError);
    },
    /**
     * @param {unknown} val
     */
    URIError (val) {
        return hasConstructor(val, URIError);
    },
    /**
     * @param {unknown} val
     */
    AggregateError (val) {
        return hasConstructor(val, AggregateError);
    },
    /**
     * @param {unknown} val
     */
    QuotaExceededError (val) {
        return toStringTag(val) === 'QuotaExceededError';
    },
    /**
     * @param {unknown} val
     */
    WebTransportError (val) {
        return toStringTag(val) === 'WebTransportError';
    },
    /**
     * @param {unknown} val
     */
    FileList (val) {
        return toStringTag(val) === 'FileList';
    },
    /**
     * @param {unknown} val
     * @param {unknown} _path
     * @param {unknown} _parent
     * @param {string|number|null} _parentPropName
     * @param {string} arg
     */
    File (val, _path, _parent, _parentPropName, arg) {
        return toStringTag(val) === 'File' &&
            (!arg || arg === /** @type {File} */ (val).type);
    },
    /**
     * @param {unknown} val
     */
    ArrayBuffer (val) {
        return toStringTag(val) === 'ArrayBuffer';
    },
    /**
     * @param {unknown} val
     */
    DataView (val) {
        return toStringTag(val) === 'DataView';
    },
    /**
     * @param {unknown} val
     */
    ImageData (val) {
        return toStringTag(val) === 'ImageData';
    },
    /**
     * @param {unknown} val
     */
    ImageBitmap (val) {
        return toStringTag(val) === 'ImageBitmap';
    },
    /**
     * @param {unknown} val
     */
    Int8Array (val) {
        return toStringTag(val) === 'Int8Array';
    },
    /**
     * @param {unknown} val
     */
    Uint8Array (val) {
        return toStringTag(val) === 'Uint8Array';
    },
    /**
     * @param {unknown} val
     */
    Uint8ClampedArray (val) {
        return toStringTag(val) === 'Uint8ClampedArray';
    },
    /**
     * @param {unknown} val
     */
    Int16Array (val) {
        return toStringTag(val) === 'Int16Array';
    },
    /**
     * @param {unknown} val
     */
    Uint16Array (val) {
        return toStringTag(val) === 'Uint16Array';
    },
    /**
     * @param {unknown} val
     */
    Int32Array (val) {
        return toStringTag(val) === 'Int32Array';
    },
    /**
     * @param {unknown} val
     */
    Uint32Array (val) {
        return toStringTag(val) === 'Uint32Array';
    },
    /**
     * @param {unknown} val
     */
    Float32Array (val) {
        return toStringTag(val) === 'Float32Array';
    },
    /**
     * @param {unknown} val
     */
    Float64Array (val) {
        return toStringTag(val) === 'Float64Array';
    },
    /**
     * @param {unknown} val
     */
    BigInt64Array (val) {
        return toStringTag(val) === 'BigInt64Array';
    },
    /**
     * @param {unknown} val
     */
    BigUint64Array (val) {
        return toStringTag(val) === 'BigUint64Array';
    },
    /**
     * @param {unknown} val
     */
    Float16Array (val) {
        return toStringTag(val) === 'Float16Array';
    },
    /**
     * @param {unknown} val
     */
    DOMMatrix (val) {
        return toStringTag(val) === 'DOMMatrix';
    },
    /**
     * @param {unknown} val
     */
    DOMMatrixReadOnly (val) {
        return toStringTag(val) === 'DOMMatrixReadOnly';
    },
    /**
     * @param {unknown} val
     */
    DOMPoint (val) {
        return toStringTag(val) === 'DOMPoint';
    },
    /**
     * @param {unknown} val
     */
    DOMPointReadOnly (val) {
        return toStringTag(val) === 'DOMPointReadOnly';
    },
    /**
     * @param {unknown} val
     */
    DOMRect (val) {
        return toStringTag(val) === 'DOMRect';
    },
    /**
     * @param {unknown} val
     */
    DOMRectReadOnly (val) {
        return toStringTag(val) === 'DOMRectReadOnly';
    },
    /**
     * @param {unknown} val
     */
    DOMQuad (val) {
        return toStringTag(val) === 'DOMQuad';
    },
    /**
     * @param {unknown} val
     */
    CryptoKey (val) {
        return toStringTag(val) === 'CryptoKey';
        //  && Boolean(val) &&
        // typeof val === 'object' &&
        // 'extractable' in /** @type {object} */ (
        //     val
        // ) && /** @type {{extractable: boolean}} */ (val).extractable;
    },
    /**
     * @param {unknown} val
     */
    AudioData (val) {
        return toStringTag(val) === 'AudioData';
    },
    /**
     * @param {unknown} val
     */
    EncodedAudioChunk (val) {
        return toStringTag(val) === 'EncodedAudioChunk';
    },
    /**
     * @param {unknown} val
     */
    EncodedVideoChunk (val) {
        return toStringTag(val) === 'EncodedVideoChunk';
    },
    /**
     * @param {unknown} val
     */
    VideoFrame (val) {
        return toStringTag(val) === 'VideoFrame';
    },
    /**
     * @param {unknown} val
     */
    CropTarget (val) {
        return toStringTag(val) === 'CropTarget';
    },
    /**
     * @param {unknown} val
     */
    FileSystemDirectoryHandle (val) {
        return toStringTag(val) === 'FileSystemDirectoryHandle';
    },
    /**
     * @param {unknown} val
     */
    FileSystemFileHandle (val) {
        return toStringTag(val) === 'FileSystemFileHandle';
    },
    /**
     * @param {unknown} val
     */
    GPUCompilationInfo (val) {
        return toStringTag(val) === 'GPUCompilationInfo';
    },
    // Not confirmed
    /**
     * @param {unknown} val
     */
    GPUCompilationMessage (val) {
        return toStringTag(val) === 'GPUCompilationMessage';
    },
    /**
     * @param {unknown} val
     */
    GPUPipelineError (val) {
        return toStringTag(val) === 'GPUPipelineError';
    },
    /**
     * @param {unknown} val
     */
    RTCCertificate (val) {
        return toStringTag(val) === 'RTCCertificate';
    },
    /**
     * @param {unknown} val
     */
    RTCEncodedAudioFrame (val) {
        return toStringTag(val) === 'RTCEncodedAudioFrame';
    },
    /**
     * @param {unknown} val
     */
    RTCEncodedVideoFrame (val) {
        return toStringTag(val) === 'RTCEncodedVideoFrame';
    }
};
