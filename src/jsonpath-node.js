import vm from 'vm';
import {JSONPath} from './jsonpath.js';

JSONPath.prototype.vm = vm;
JSONPath.prototype.safeVm = vm;

const SafeScript = vm.Script;

export {
    JSONPath,
    SafeScript
};
