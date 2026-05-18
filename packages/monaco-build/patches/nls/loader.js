(function() {
    const K = "_VSCODE_NLS";
    let loaded;
    try {
        const nls = localStorage.getItem(K);
        if (nls) {
            loaded = JSON.parse(nls);
        }
    } catch {
    }
    if (!loaded) {
        return;
    }
    if (typeof loaded.language !== "string" || !Array.isArray(loaded.messages)) {
        console.error("Invalid VsCode NLS data. Removing");
        localStorage.removeItem(K);
    }
    if (loaded) {
        globalThis._VSCODE_NLS_LANGUAGE = loaded.language;
        globalThis._VSCODE_NLS_MESSAGES = loaded.messages;
    }
})();
