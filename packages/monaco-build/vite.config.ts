import { configure } from "mono-dev/lib-build-config";
import type { UserConfig } from "mono-dev/vite";

export default <Promise<UserConfig>>configure({
    build: {
        rolldownOptions: {
            external: [
                "intwc:virtual-monaco-pre-loader",
                "intwc:virtual-monaco-loader"
            ],
            output: {
                chunkFileNames: "[name].js",
                assetFileNames: "assets/[name][extname]",
            }
        }
    }
});
