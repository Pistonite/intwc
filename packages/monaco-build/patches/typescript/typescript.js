
const language= /* <monaco.languages.IMonarchLanguage>*/ {
    ...languageOriginal,
    tokenizer: {
        ...languageOriginal.tokenizer,
        common: [
            // New rules
            [/(true|false)/, "constant.language.boolean"],
            [/null/, "constant.language.null"],
            [/undefined/, "constant.language.undefined"],
            [/(this|super|self)/, "variable.language"],
            // something that *could* be a function call/declaration
            [
                /#?[a-z_$][\w$]*(?=(\s*\(|\s*<.*>\s*\(|\s*`))/,
                { cases: { "@keywords": "keyword", "@default": "function" } },
            ],

            // patch old rule
            [/#?[a-z_$][\w$]*/, { cases: { "@keywords": "keyword", "@default": "variable" } }],
            ...languageOriginal.tokenizer.common.slice(1),
        ],
    },
};
export { conf, language };
