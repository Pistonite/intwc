(function() {
    let loaded;
    try {
        const nls = localStorage.getItem("_VSCODE_NLS");
        if (nls) {
            loaded = JSON.parse(nls);
        }
    } catch {
    }
    if (loaded) {
        globalThis._VSCODE_NLS_LANGUAGE = loaded.language;
        globalThis._VSCODE_NLS_MESSAGES = loaded.messages;
    }
})();
