import {promisify} from "node:util";
import {exec as _exec} from "node:child_process";
import path from "node:path";

const exec = promisify(_exec);

describe("JSONPath - cli", () => {
    it("with filePath and jsonPath", async () => {
        const out = await exec("bin/jsonpath-cli.js package.json name");
        expect(out.stdout).to.equal("[ 'jsonpath-plus' ]\n");
    });

    it("invalid arguments", async () => {
        const binPath = path.resolve("bin/jsonpath-cli.js");
        let out;
        try {
            out = await exec("bin/jsonpath-cli.js wrong-file.json");
        } catch (err) {
            out = err;
        }
        expect(out).to.have.property("code", 1);
        expect(out).to.have.property("stderr");
        expect(
            /** @type {{stderr: string}} */
            (out).stderr
        ).to.include(`usage: ${binPath} <file> <path>\n\n`);
    });
});
