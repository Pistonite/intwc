import { configure } from "mono-dev/lib-build-config";
import type { UserConfig } from "mono-dev/vite";

const isIntwcI18nChunk = (id: string): string => {
    const match = id.match(/intwc[/\\]src[/\\]i18n[/\\]strings[/\\](.*)/);
    if (!match) {
        return "";
    }
    const fileName = match[1];
    if (!fileName.endsWith(".yaml")) {
        return "";
    }
    return fileName.substring(0, fileName.length - 5);
};

export default <Promise<UserConfig>>configure({
    build: {
        rolldownOptions: {
            external: [/^intwc:virtual/, /^@pistonite\/intwc\/monaco/],
            output: {
                chunkFileNames: ({ facadeModuleId, moduleIds }) => {
                    if (facadeModuleId) {
                        const facadeName = isIntwcI18nChunk(facadeModuleId);
                        if (!facadeName) {
                            return "[name].js";
                        }
                        return `i18n/${facadeName}.js`;
                    }
                    for (const id of moduleIds) {
                        const n = isIntwcI18nChunk(id);
                        if (n) {
                            return `i18n/${n}.js`;
                        }
                    }
                    return "[name].js";
                },
            },
        },
    },
});
