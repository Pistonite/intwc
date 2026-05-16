import fs from "node:fs";

export class Patcher {
    private filePath: string;
    private lines: string[];
    private currentLine = 0;
    private outLines: string[] = [];

    constructor(filePath: string) {
        this.filePath = filePath;
        this.lines = fs.readFileSync(filePath, "utf-8").split("\n");
    }

    public head(): string {
        return this.lines[this.currentLine];
    }

    public skipToEnd() {
        this.outLines.push(...this.lines.slice(this.currentLine));
        this.currentLine = this.lines.length;
    }

    public finish(): string {
        this.skipToEnd();
        const out = this.outLines.join("\n");
        fs.writeFileSync(this.filePath, out);
        return out;
    }
    /**
     * skip from currentLine until a line matches a condition
     * update currentLine. Throws if not found.
     *
     * new current line will not be pushed, but skipped lines will
     */
    public skipUntil(matches: (line: string) => boolean) {
        for (; this.currentLine < this.lines.length; this.currentLine++) {
            if (matches(this.head())) {
                return;
            }
            this.outLines.push(this.head());
        }
        throw new Error("Not found");
    }
    public commentOutUntil(matches: (line: string) => boolean) {
        for (; this.currentLine < this.lines.length; this.currentLine++) {
            if (matches(this.head())) {
                return;
            }
            this.outLines.push("//" + this.head());
        }
        throw new Error("Not found");
    }
    public skipOne() {
        this.outLines.push(this.head());
        this.currentLine++;
    }
    public commentOutOne() {
        this.outLines.push("//" + this.head());
        this.currentLine++;
    }
    public pushPatch(content: string) {
        this.outLines.push(
            ...content
                .split("\n")
                .filter(Boolean)
                .map((line) => line.trimEnd()),
        );
    }

    public insertPatchInlineBefore(content: string, before: string) {
        const line = this.head();
        const index = line.indexOf(before);
        if (index === -1) {
            throw new Error("`before` not found in addPatchInlineBefore");
        }
        this.lines[this.currentLine] = line.substring(0, index) + content + line.substring(index);
    }
}
