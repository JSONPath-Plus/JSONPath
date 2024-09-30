/* globals JSONPath */
/* eslint-disable import/unambiguous */

// Todo: Extract testing example paths/contents and use for a
//         pulldown that can populate examples

// Todo: Make configurable with other JSONPath options

// Todo: Allow source to be treated as an (evaled) JSON object

// Todo: Could add JSON/JS syntax highlighting in sample and result,
//   ideally with a jsonpath-plus parser highlighter as well

const $ = (s) => document.querySelector(s);

const jsonpathEl = $('#jsonpath');
const updateResults = () => {
    const jsonSample = $('#jsonSample');
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
    updateResults();
});

$('#jsonSample').addEventListener('input', () => {
    updateResults();
});

$('#eval').addEventListener('change', () => {
    updateResults();
});

$('#ignoreEvalErrors').addEventListener('change', () => {
    updateResults();
});

window.addEventListener('load', updateResults);
