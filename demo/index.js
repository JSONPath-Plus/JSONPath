/// <reference path="./types.d.ts" />
/* globals JSONPath, LZString -- Test UMD */
/* eslint-disable import/unambiguous -- Demo */

// Todo: Extract testing example paths/contents and use for a
//         pulldown that can populate examples

// Todo: Make configurable with other JSONPath options

// Todo: Allow source to be treated as an (evaled) JSON object

// Todo: Could add JSON/JS syntax highlighting in sample and result,
//   ideally with a jsonpath-plus parser highlighter as well

const $ = (s) => document.querySelector(s);

const jsonpathEl = $('#jsonpath');
const jsonSample = $('#jsonSample');

const updateUrl = () => {
    const path = jsonpathEl.value;
    const jsonText = LZString.compressToEncodedURIComponent(jsonSample.value);
    const url = new URL(location.href);
    url.searchParams.set('path', path);
    url.searchParams.set('json', jsonText);
    url.searchParams.set('eval', $('#eval').value);
    url.searchParams.set('ignoreEvalErrors', $('#ignoreEvalErrors').value);
    history.replaceState(null, '', url.toString());
};

const loadUrl = () => {
    const url = new URL(location.href);
    if (url.searchParams.has('path')) {
        jsonpathEl.value = url.searchParams.get('path');
    }
    if (url.searchParams.has('json')) {
        jsonSample.value = LZString.decompressFromEncodedURIComponent(
            url.searchParams.get('json')
        );
    }
    if (url.searchParams.has('eval')) {
        $('#eval').value = url.searchParams.get('eval');
    }
    if (url.searchParams.has('ignoreEvalErrors')) {
        $('#ignoreEvalErrors').value = url.searchParams.get('ignoreEvalErrors');
    }
};

const updateResults = () => {
    const reportValidity = () => {
        // Doesn't work without a timeout
        setTimeout(() => {
            jsonSample.reportValidity();
            jsonpathEl.reportValidity();
        });
    };
    let json;
    jsonSample.setCustomValidity('');
    jsonpathEl.setCustomValidity('');
    reportValidity();
    try {
        json = JSON.parse(jsonSample.value);
    } catch (err) {
        jsonSample.setCustomValidity('Error parsing JSON: ' + err.toString());
        reportValidity();
        return;
    }
    try {
        const result = new JSONPath.JSONPath({
            path: jsonpathEl.value,
            json,
            eval: $('#eval').value === 'false' ? false : $('#eval').value,
            ignoreEvalErrors: $('#ignoreEvalErrors').value === 'true'
        });
        $('#results').value = JSON.stringify(result, null, 2);
    } catch (err) {
        jsonpathEl.setCustomValidity(
            'Error executing JSONPath: ' + err.toString()
        );
        reportValidity();
        $('#results').value = '';
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
