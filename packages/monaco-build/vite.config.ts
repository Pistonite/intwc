import { configure } from "mono-dev/lib-build-config";
import type { UserConfig } from "mono-dev/vite";

export default <Promise<UserConfig>>configure({
    // make sure we are not generating any worker chunks,
    // as they must be done at the app level to get the correct URL
    worker: {
        rolldownOptions: {
            output: {
                entryFileNames: () => {
                    throw new Error(
                        "Unexpected worker entry. monaco-build should not produce any workers!",
                    );
                },
            },
        },
    },
    build: {
        rolldownOptions: {
            external: [
                // virtual modules loaded by the intwc vite plugin
                /^intwc:virtual/,
                // ?worker imports, to be resolved by the final app
                /\?worker$/,
            ],
            output: {
                chunkFileNames: "o/[name].js",
                assetFileNames: "assets/[name][extname]",
            },
        },
    },
});
