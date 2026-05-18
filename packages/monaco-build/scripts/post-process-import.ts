import fs from "node:fs";
import path from "node:path";

const dtsDir = path.resolve(
    path.dirname(import.meta.dirname),
    "node_modules",
    ".mono",
    "pnpm-pack.temp",
    "package",
    "dist",
    "_dts_",
);

// Replace comment syntax chars with spaces (preserving char count for sourcemap integrity).
// Handles blocks of this form:
//
//   /**
//    * @post-process-import
//    * <code line>
//    * <code line>
//    */
//
// Rules per line:
//   "/**"         -> "   "        (3 spaces, same length)
//   " * @..."     -> all spaces   (annotation line, same length)
//   " * <code>"   -> "   <code>"  (replace " * " prefix with "   ")
//   " */"         -> "   "        (3 spaces, same length)
const uncommentLine = (line: string): string => {
    if (line === "/**" || line === " */") {
        return " ".repeat(line.length);
    }
    if (line.startsWith(" * @")) {
        return " ".repeat(line.length);
    }
    if (line.startsWith(" * ")) {
        return "   " + line.slice(3);
    }
    return line;
};

const processFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, "utf-8");
    if (!content.includes("@post-process-import")) {
        return;
    }
    const lines = content.split("\n");
    const out: string[] = [];
    let inBlock = false;
    for (const line of lines) {
        if (!inBlock) {
            if (line === "/**") {
                // peek at next line to see if this is a @post-process-import block
                const next = lines[out.length + 1];
                if (next !== undefined && next.startsWith(" * @post-process-import")) {
                    inBlock = true;
                    out.push(uncommentLine(line));
                    continue;
                }
            }
            out.push(line);
        } else {
            out.push(uncommentLine(line));
            if (line === " */") {
                inBlock = false;
            }
        }
    }
    fs.writeFileSync(filePath, out.join("\n"));
};

for (const entry of fs.readdirSync(dtsDir, { recursive: true, encoding: "utf-8" })) {
    if (entry.endsWith(".d.ts")) {
        processFile(path.join(dtsDir, entry));
    }
}
