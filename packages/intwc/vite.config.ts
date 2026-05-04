import { configure } from "mono-dev/lib-build-config";
import type { UserConfig } from "mono-dev/vite";

export default <Promise<UserConfig>>configure({
    build: {
        rolldownOptions: {
            external: [
                /^intwc:virtual/,
                "@pistonite/intwc/monaco"
            ],
        }
    }
});
