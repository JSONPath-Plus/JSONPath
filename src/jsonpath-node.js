import vm from 'vm';
import {JSONPath} from './jsonpath.js';

JSONPath.prototype.vm = vm;
JSONPath.prototype.safeVm = vm;

export {JSONPath};
