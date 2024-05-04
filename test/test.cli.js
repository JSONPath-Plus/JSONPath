import {promisify} from "util";
import {exec as _exec} from "child_process";
import path from "path";

const exec = promisify(_exec);

describe("JSONPath - cli", () => {
    it("with filePath and jsonPath", async () => {
        const out = await exec("bin/jsonpath-cli.js package.json name");
        expect(out.stdout).to.equal("[ 'jsonpath-plus' ]\n");
    });

    it("invalid arguments", async () => {
        const binPath = path.resolve("bin/jsonpath-cli.js");
        const out = await exec("bin/jsonpath-cli.js wrong-file.json").catch(
            (e) => e
        );
        expect(out).to.have.property("code", 1);
        expect(out).to.have.property(
            "stderr",
            `usage: ${binPath} <file> <path>\n\n` +
                `[Error: ENOENT: no such file or directory, open 'wrong-file.json'] {\n` +
                `  errno: -2,\n` +
                `  code: 'ENOENT',\n` +
                `  syscall: 'open',\n` +
                `  path: 'wrong-file.json'\n` +
                "}\n"
        );
    });
});
