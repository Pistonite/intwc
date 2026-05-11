import { configure } from 'mono-dev/app-build-config';
import intwc from "@pistonite/intwc/vite-plugin";

export default configure({
  plugins: [
        intwc({
            languages: ["java", "typescript"],
            translations: ["zh-cn", "ja"]
        }),
  ],
})
