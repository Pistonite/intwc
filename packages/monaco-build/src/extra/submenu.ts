/**
 * @post-process-import
 * import type * as monaco from "../editor_main.ts";
 * type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
 */

import { MenuId as MenuIdImpl, MenuRegistry } from "#monaco/vs/platform/actions/common/actions.js";
import { CommandsRegistry } from "#monaco/vs/platform/commands/common/commands.js";
import { ICodeEditorService } from "#monaco/vs/editor/browser/services/codeEditorService.js";
import { StandaloneServices } from "#monaco/vs/editor/standalone/browser/standaloneServices.js";
import { ContextKeyExpr } from "#monaco/vs/platform/contextkey/common/contextkey.js";

import type { MenuId, ContextKeyExpression } from "./vs_types/index.ts";

export const contextKeyEquals = (key: string, value: unknown): ContextKeyExpression => {
    return ContextKeyExpr.equals(key, value);
};

/** Create and register a menu id */
export const createMenuId = (id: string): MenuId => {
    return new MenuIdImpl(id);
};

export interface ContextSubmenuItem {
    id: string;
    title: string;
    toggled?: ContextKeyExpression;
    // @ts-expect-error code editor type
    run: (editor: IStandaloneCodeEditor) => void;
}

export interface RegisterContextSubmenuOptions {
    menuId: MenuId;
    title: string;
    group: string;
    items: ContextSubmenuItem[];
    /**
     * If provided, the submenu anchor is only shown when this context key is truthy
     * on the focused editor. Use `editor.createContextKey(whenKey, true)` per editor
     * instance to control visibility.
     */
    whenKey?: string;
}

/** Register a submenu and add it as an entry in the editor context menu. Call once globally. */
export const registerContextSubmenu = (options: RegisterContextSubmenuOptions) => {
    const { menuId, title, group, items, whenKey } = options;
    for (const item of items) {
        CommandsRegistry.registerCommand(item.id, () => {
            const editorService = StandaloneServices.get(ICodeEditorService);
            const editor = editorService.getFocusedCodeEditor();
            if (editor) {
                item.run(editor);
            }
        });

        MenuRegistry.appendMenuItem(menuId, {
            command: { id: item.id, title: item.title, toggled: item.toggled },
            group: "navigation",
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MenuRegistry.appendMenuItem((MenuIdImpl as any).EditorContext, {
        submenu: menuId,
        title,
        group,
        when: whenKey ? ContextKeyExpr.has(whenKey) : undefined,
    });
};
