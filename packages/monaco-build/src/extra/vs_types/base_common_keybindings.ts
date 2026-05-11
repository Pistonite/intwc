/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// https://github.com/microsoft/vscode/blob/main/src/vs/base/common/keybindings.ts
/**
 * A resolved keybinding. Consists of one or multiple chords.
 */
export abstract class ResolvedKeybinding {
	/**
	 * This prints the binding in a format suitable for displaying in the UI.
	 */
	public abstract getLabel(): string | null;
	/**
	 * This prints the binding in a format suitable for ARIA.
	 */
	public abstract getAriaLabel(): string | null;
	/**
	 * This prints the binding in a format suitable for electron's accelerators.
	 * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
	 */
	public abstract getElectronAccelerator(): string | null;
	/**
	 * This prints the binding in a format suitable for user settings.
	 */
	public abstract getUserSettingsLabel(): string | null;
	/**
	 * Is the user settings label reflecting the label?
	 */
	public abstract isWYSIWYG(): boolean;
	/**
	 * Does the keybinding consist of more than one chord?
	 */
	public abstract hasMultipleChords(): boolean;
	/**
	 * Returns the chords that comprise of the keybinding.
	 */
	public abstract getChords(): ResolvedChord[];
	/**
	 * Returns the chords as strings useful for dispatching.
	 * Returns null for modifier only chords.
	 * @example keybinding "Shift" -> null
	 * @example keybinding ("D" with shift == true) -> "shift+D"
	 */
	public abstract getDispatchChords(): (string | null)[];
	/**
	 * Returns the modifier only chords as strings useful for dispatching.
	 * Returns null for chords that contain more than one modifier or a regular key.
	 * @example keybinding "Shift" -> "shift"
	 * @example keybinding ("D" with shift == true") -> null
	 */
	public abstract getSingleModifierDispatchChords(): (SingleModifierChord | null)[];
}
export interface ResolvedChord {
    readonly ctrlKey: boolean,
    readonly shiftKey: boolean,
    readonly altKey: boolean,
    readonly metaKey: boolean,
    readonly keyLabel: string | null,
    readonly keyAriaLabel: string | null
}
export type SingleModifierChord = 'ctrl' | 'shift' | 'alt' | 'meta';
