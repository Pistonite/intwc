
import { StandaloneServices } from "#monaco/vs/editor/standalone/browser/standaloneServices.js";
import { IQuickInputService } from "#monaco/vs/platform/quickinput/common/quickInput.js";
import type { IQuickPickItem, IQuickPickSeparator } from "./vs_types/index.ts";

/** A quick picker item with an arbitrary typed payload attached. */
export type PickerItem<T> = ({ payload: T } & IQuickPickItem)
| IQuickPickSeparator;

/**
 * Show the Monaco quick picker UI with the given items.
 * Resolves with the selected item's payload, or undefined if dismissed.
 * Requires a focused editor — the picker is mounted inside the active editor container.
 */
export function showQuickPicker<T>(items: PickerItem<T>[]): Promise<T | undefined> {
    return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const svc = StandaloneServices.get(IQuickInputService) as any;
        const picker = svc.createQuickPick();
        picker.items = items;
        picker.onDidAccept(() => {
            const item = picker.selectedItems[0];
            if (!item || item.pickable === false) {
                return;
            }
            const payload = item.payload;
            if (payload) {
                resolve(payload);
            } else {
                resolve(undefined);
            }
            picker.dispose();
        });
        // resolve(undefined) is a no-op if onDidAccept already resolved
        picker.onDidHide(() => {
            resolve(undefined);
            picker.dispose();
        });
        picker.show();
    });
}
