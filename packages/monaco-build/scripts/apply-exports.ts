/* eslint-disable @typescript-eslint/no-dynamic-delete */
import fs from "node:fs";
import path from "node:path";

const PREFIX = "./monaco";
const SRC_LOCATION = "./src/monaco";

const rootPath = path.dirname(import.meta.dirname);
const buildPkgJsonPath = path.resolve(
    rootPath,
    "node_modules",
    ".mono",
    "pnpm-pack.temp",
    "package",
    "package.json"
);
const outPkgJsonPath = path.resolve(path.dirname(rootPath), "intwc", "package.json");
const outPkgJson = JSON.parse(fs.readFileSync(outPkgJsonPath, "utf-8"));
const outExports = outPkgJson.exports;
for (const key in outExports) {
    if (key.startsWith("./monaco")) {
        delete outExports[key];
    }
}

const buildPkgJson = JSON.parse(fs.readFileSync(buildPkgJsonPath, "utf-8"));
const exports = buildPkgJson.exports;
for (const key in exports) {
    let outKey;
    if (key === ".") {
        outKey = PREFIX;
    } else if (key.startsWith("./")) {
        outKey = PREFIX + key.substring(1);
    } else {
        throw new Error("Unexpected export key: "+ key);
    }
    if (typeof exports[key] === "string") {
        const path = exports[key];
        if (!path.startsWith("./dist")) {
            throw new Error("Unexpected export path: "+path);
        }
        outExports[outKey] = SRC_LOCATION + path.substring(1);
    } else {
        const importPath = exports[key].import;
        if (!importPath.startsWith("./dist")) {
            throw new Error("Unexpected import path: "+importPath);
        }
        const typesPath = exports[key].types;
        if (!typesPath.startsWith("./dist")) {
            throw new Error("Unexpected types path: "+typesPath);
        }
        outExports[outKey] = {
            import: SRC_LOCATION + importPath.substring(1),
            types: SRC_LOCATION + typesPath.substring(1),
        };
    }
}

fs.writeFileSync(
    outPkgJsonPath,
    JSON.stringify(outPkgJson, undefined, 4),
);

