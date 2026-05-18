/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IJSONSchema } from "./base_common_jsonSchema.ts";
import type { TypeConstraint } from "./base_common_types.ts";
import type { ILocalizedString } from "./platform_actions.ts";

// https://github.com/microsoft/vscode/blob/main/src/vs/platform/commands/common/commands.ts
export interface ICommandMetadata {
	/**
	 * NOTE: Please use an ILocalizedString. string is in the type for backcompat for now.
	 * A short summary of what the command does. This will be used in:
	 * - API commands
	 * - when showing keybindings that have no other UX
	 * - when searching for commands in the Command Palette
	 */
	readonly description: ILocalizedString | string;
	readonly args?: ReadonlyArray<{
		readonly name: string;
		readonly isOptional?: boolean;
		readonly description?: string;
		readonly constraint?: TypeConstraint;
		readonly schema?: IJSONSchema;
	}>;
	readonly returns?: string;
}
