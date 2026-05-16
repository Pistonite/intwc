/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// https://github.com/microsoft/vscode/blob/main/src/vs/base/common/themables.ts
export interface ThemeIcon {
	readonly id: string;
	readonly color?: ThemeColor;
}
export interface ThemeColor {
	id: string;
}
