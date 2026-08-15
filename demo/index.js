/* globals JSONPath, LZString -- Test UMD */
/// <reference path="./types.d.ts" />

// Todo: Extract testing example paths/contents and use for a
//         pulldown that can populate examples

// Todo: Make configurable with other JSONPath options

// Todo: Allow source to be treated as an (evaled) JSON object

// Todo: Could add JSON/JS syntax highlighting in sample and result,
//   ideally with a jsonpath-plus parser highlighter as well

/**
 * @param {string} s
 * @returns {HTMLElement}
 */
const $ = (s) => /** @type {HTMLElement} */ (document.querySelector(s));

/**
 * @param {string} s
 * @returns {HTMLInputElement}
 */
const $i = (s) => /** @type {HTMLInputElement} */ (document.querySelector(s));

const jsonpathEl = $i('#jsonpath');
const jsonSample = $i('#jsonSample');

const updateUrl = () => {
    const path = jsonpathEl.value;
    const jsonText = LZString.compressToEncodedURIComponent(jsonSample.value);
    const url = new URL(location.href);
    url.searchParams.set('path', path);
    url.searchParams.set('json', jsonText);
    url.searchParams.set('eval', $i('#eval').value);
    url.searchParams.set('ignoreEvalErrors', $i('#ignoreEvalErrors').value);
    history.replaceState(null, '', url.href);
};

const loadUrl = () => {
    const url = new URL(location.href);
    if (url.searchParams.has('path')) {
        jsonpathEl.value = /** @type {string} */ (url.searchParams.get('path'));
    }
    if (url.searchParams.has('json')) {
        jsonSample.value = LZString.decompressFromEncodedURIComponent(
            /** @type {string} */ (url.searchParams.get('json'))
        );
    }
    if (url.searchParams.has('eval')) {
        $i('#eval').value = /** @type {string} */ (
            url.searchParams.get('eval')
        );
    }
    if (url.searchParams.has('ignoreEvalErrors')) {
        $i('#ignoreEvalErrors').value = /** @type {string} */ (
            url.searchParams.get('ignoreEvalErrors')
        );
    }
};

const updateResults = () => {
    const reportValidity = () => {
        // Doesn't work without a timeout
        setTimeout(() => {
            jsonSample.reportValidity();
            jsonpathEl.reportValidity();
        }, 0);
    };
    let json;
    jsonSample.setCustomValidity('');
    jsonpathEl.setCustomValidity('');
    reportValidity();
    try {
        json = JSON.parse(jsonSample.value);
    } catch (err) {
        jsonSample.setCustomValidity(
            'Error parsing JSON: ' +
            /** @type {Error} */ (err).toString()
        );
        reportValidity();
        return;
    }
    try {
        const result = new JSONPath.JSONPath({
            path: jsonpathEl.value,
            json,
            eval: $i('#eval').value === 'false' ? false : $i('#eval').value,
            ignoreEvalErrors: $i('#ignoreEvalErrors').value === 'true'
        });
        $i('#results').value = JSON.stringify(result, null, 2);
    } catch (err) {
        jsonpathEl.setCustomValidity(
            'Error executing JSONPath: ' +
            /** @type {Error} */
            (err).toString()
        );
        reportValidity();
        $i('#results').value = '';
    }
};

$('#jsonpath').addEventListener('input', () => {
    updateUrl();
    updateResults();
});

$('#jsonSample').addEventListener('input', () => {
    updateUrl();
    updateResults();
});

$('#eval').addEventListener('change', () => {
    updateUrl();
    updateResults();
});

$('#ignoreEvalErrors').addEventListener('change', () => {
    updateUrl();
    updateResults();
});

window.addEventListener('load', () => {
    loadUrl();
    updateResults();
});
