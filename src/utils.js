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
