/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference lib="dom" />
declare module "*.css" {}
declare module "#monaco/vs/common/workers.js" {
    declare function createWebWorker<T extends object>(
        opts: IWebWorkerOptions,
    ): editor.MonacoWebWorker<T>;
    interface IWebWorkerOptions {
        /**
         * The AMD moduleId to load.
         * It should export a function `create` that should return the exported proxy.
         */
        moduleId: string;
        createWorker?: () => Worker;
        /**
         * The data to send over when calling create on the module.
         */
        createData?: any;
        /**
         * A label to be used to identify the web worker for debugging purposes.
         */
        label?: string;
        /**
         * An object that can be used by the web worker to make calls back to the main thread.
         */
        host?: any;
        /**
         * Keep idle models.
         * Defaults to false, which means that idle models will stop syncing after a while.
         */
        keepIdleModels?: boolean;
    }
}
declare module "#monaco/vs/editor/internal/initialize.js" {
    declare function getGlobalMonaco(): any;
}
declare module "#monaco/vs/editor/standalone/browser/standaloneServices.js" {
    declare const StandaloneServices: any;
}
declare module "#monaco/vs/platform/quickinput/common/quickInput.js" {
    declare const IQuickInputService: any;
    declare enum QuickInputButtonLocation {
        /**
         * In the title bar.
         */
        Title = 1,
        /**
         * To the right of the input box.
         */
        Inline = 2,
        /**
         * At the far end inside the input box.
         * Used by the public API to create toggles.
         */
        Input = 3,
    }
}
declare module "#monaco/vs/platform/actions/common/actions.js" {
    declare class MenuId {
        constructor(id: string);
        id: string;
    }
    declare const MenuRegistry: any;
}
declare module "#monaco/vs/platform/commands/common/commands.js" {
    declare const CommandsRegistry: any;
}
declare module "#monaco/vs/platform/contextkey/common/contextkey.js" {
    declare const ContextKeyExpr: any;
}
declare module "#monaco/vs/editor/browser/services/codeEditorService.js" {
    declare const ICodeEditorService: any;
}

declare module "#monaco/vs/editor/edcore.main.js" {}

declare module "intwc:virtual-monaco-env-loader" {}
declare module "intwc:virtual-monaco-global-loader" {
    import type * as monaco from "monaco-editor";
    declare function vLoadMonacoGlobals(getGlobalMonaco: () => any): {
        css: monaco.css;
        json: monaco.json;
        html: monaco.html;
        typescript: monaco.typescript;
    };
}
declare module "intwc:virtual-monaco-nls-loader" {
    declare function vGetLoadedVscodeNlsLanguages(): string[];
    declare function vLoadVscodeNls(language: string): Promise<
        | {
              default: { messages: string[]; language: string };
          }
        | undefined
    >;
}
