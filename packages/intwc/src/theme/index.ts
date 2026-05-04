
import * as monaco from "@pistonite/intwc/monaco";
import { addDarkSubscriber } from "@pistonite/celera";

import { log } from "#util";

import { DarkTheme, LightTheme, type Theme } from "./colors.gen.ts";

export const initThemes = (options: ThemeOptions) => {
    const customTokenColors = options.customTokenColors || [];
    defineTheme("intwc-dark", "vs-dark", DarkTheme, customTokenColors);
    defineTheme("intwc-light", "vs", LightTheme as unknown as Theme, customTokenColors);

    addDarkSubscriber((dark) => {
        monaco.editor.setTheme(dark ? "intwc-dark" : "intwc-light");
    }, true);
};

const defineTheme = (
    name: string,
    base: "vs" | "vs-dark",
    theme: Theme,
    customTokenColors: CustomTokenColor[],
) => {
    const dark = base === "vs-dark";
    const tokenNameToColor = new Map<string, string>();
    theme.tokenColors.forEach(({ token, foreground }) => {
        tokenNameToColor.set(token, foreground);
    });
    const rules = [...theme.tokenColors];
    customTokenColors.forEach(({ token, value }) => {
        if (typeof value === "string") {
            if (value.startsWith("#")) {
                tokenNameToColor.set(token, value);
                rules.push({ token, foreground: value });
            } else {
                const color = tokenNameToColor.get(value);
                if (!color) {
                    log.warn(`unknown token in custom color: ${value}`);
                    return;
                }
                rules.push({ token, foreground: color });
            }
            return;
        }
        const color = value[dark ? 1 : 0];
        tokenNameToColor.set(token, color);
        rules.push({ token, foreground: color });
    });
    monaco.editor.defineTheme(name, {
        base,
        inherit: true,
        colors: theme.editorColors,
        rules,
    });
};
export interface ThemeOptions {
    customTokenColors?: CustomTokenColor[]
};

export interface CustomTokenColor {
    /**
     * The token to set the color for.
     *
     * For example: string.regexp
     */
    token: string;

    /**
     * The color to set the token to.
     *
     * This can either be "#" followed by 6 hexadecimal digits to
     * set the color exactly, or another token name to use the color
     * of that token.
     *
     * If the color needs to be different for light and dark mode
     * (which is almost always the case), use an array of 2 colors [light, dark]
     */
    value: string | [string, string];
};
