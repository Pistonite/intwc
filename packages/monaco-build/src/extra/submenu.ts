/**
 * @post-process-import
 * import type * as monaco from "../editor_main.ts";
 * type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
 */

import { MenuId as MenuIdImpl, MenuRegistry } from "#monaco/vs/platform/actions/common/actions.js";
import { CommandsRegistry } from "#monaco/vs/platform/commands/common/commands.js";
import { ICodeEditorService } from "#monaco/vs/editor/browser/services/codeEditorService.js";
import { StandaloneServices } from "#monaco/vs/editor/standalone/browser/standaloneServices.js";

import type { MenuId } from "./vs_types/index.ts";

/** Create and register a menu id */
export const createMenuId = (id: string): MenuId => {
    return new MenuIdImpl(id);
};

export interface ContextSubmenuItem {
    id: string;
    title: string;
    // @ts-expect-error code editor type
    run: (editor: IStandaloneCodeEditor) => void;
}

/** Register a submenu */
export const registerContextSubmenu = (menuId: MenuId, items: ContextSubmenuItem[]) => {
    for (const item of items) {
        CommandsRegistry.registerCommand(item.id, () => {
            const editorService = StandaloneServices.get(ICodeEditorService);
            const editor = editorService.getFocusedCodeEditor();
            if (editor) {
                item.run(editor);
            }
        });

        MenuRegistry.appendMenuItem(menuId, {
            command: { id: item.id, title: item.title },
            group: "navigation",
        });
    }
};
