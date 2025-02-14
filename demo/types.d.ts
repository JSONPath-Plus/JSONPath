import '../src/jsonpath.d.ts'
import type { JSONPathType } from 'jsonpath-plus';

declare global {
    var LZString: {
        decompressFromEncodedURIComponent: (value: string) => string;
        compressToEncodedURIComponent: (value: string) => string;
    };
    var JSONPath: {
        JSONPath: JSONPathType
    }
}
