import type {JSONPathClass} from 'jsonpath-plus';

declare global {
    var LZString: {
        decompressFromEncodedURIComponent: (value: string) => string;
        compressToEncodedURIComponent: (value: string) => string;
    };
    var JSONPath: {
        JSONPath: typeof JSONPathClass
    }
}
