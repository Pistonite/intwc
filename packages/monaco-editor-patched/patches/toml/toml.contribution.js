import { registerLanguage } from "../_.contribution.js";

registerLanguage({
    id: "toml",
    extensions: [".toml"],
    aliases: ["TOML", "toml"],
    mimetypes: ["application/toml", "text/toml"],
    loader: () => import("./toml"),
});
