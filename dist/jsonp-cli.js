#!/usr/bin/env node

import { readFileSync } from "fs";
import { JSONPath as jsonpath } from "../dist/index-node-esm.js";

const file = process.argv[2];
const path = process.argv[3];

try {
    const json = JSON.parse(readFileSync(file, "utf-8"));
    runQuery(json, path);
} catch (e) {
    console.error(`usage: ${process.argv[1]} <file> <path>\n`);
    console.error(e);
    process.exit(1);
}

function runQuery(json, path) {
    const result = jsonpath({
        json,
        path,
    });

    // eslint-disable-next-line no-console
    console.log("result", result);
}
