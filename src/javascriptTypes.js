import {toStringTag} from './utils.js';

export default {
    /**
     * @param {unknown} val
     */
    Generator (val) {
        return toStringTag(val) === 'Generator';
    },
    /**
     * @param {unknown} val
     */
    AsyncGenerator (val) {
        return toStringTag(val) === 'AsyncGenerator';
    },
    /**
     * @param {unknown} val
     */
    GeneratorFunction (val) {
        return toStringTag(val) === 'GeneratorFunction';
    },
    /**
     * @param {unknown} val
     */
    AsyncGeneratorFunction (val) {
        return toStringTag(val) === 'AsyncGeneratorFunction';
    },
    /**
     * @param {unknown} val
     */
    Iterable (val) {
        return Boolean(
            val && typeof val === 'object' &&
            // eslint-disable-next-line @stylistic/max-len -- Long
            // eslint-disable-next-line unicorn/no-computed-property-existence-check -- TS
            Symbol.iterator in val &&
            typeof val[Symbol.iterator] === 'function'
        );
    },
    /**
     * @param {unknown} val
     */
    AsyncIterable (val) {
        return Boolean(
            val && typeof val === 'object' &&
            // eslint-disable-next-line @stylistic/max-len -- Long
            // eslint-disable-next-line unicorn/no-computed-property-existence-check -- TS
            Symbol.asyncIterator in val &&
            typeof val[Symbol.asyncIterator] === 'function'
        );
    },
    /**
     * @param {unknown} val
     */
    Iterator (val) {
        return Boolean(
            val && typeof val === 'object' &&
            'next' in val &&
            typeof val.next === 'function'
        );
    }
};
