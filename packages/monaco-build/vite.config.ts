import { configure } from "mono-dev/lib-build-config";
import type { UserConfig } from "mono-dev/vite";

export default <Promise<UserConfig>>configure({
    build: {
        rolldownOptions: {
            external: [
                // virtual module that defines globalThis.MonacoEnvironment
                // patched (injected) into esm/vs/base/browser/browser.js
                // manually checked to be the choke point for any side-effects
                // that accesses MonacoEnvironment
                "intwc:virtual-monaco-env-loader",
                // The "late" loader just before finishing the init
                "intwc:virtual-monaco-global-loader",
                // Load nls messages
                "intwc:virtual-monaco-nls-loader"
            ],
            output: {
                chunkFileNames: "o/[name].js",
                assetFileNames: "assets/[name][extname]",
            }
        }
    }
});
