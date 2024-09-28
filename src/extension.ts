import * as vscode from 'vscode';
import SortCSS, { SortMethod } from './SortCSS';
import { writeFileSync } from 'fs';

const MESSAGES_PREFIX = 'SortCSS:';

function Sort(
	editor: vscode.TextEditor | undefined,
	sortMethod = SortMethod.ByCategory,
	addCategoryComments = false,
	showMessages = true
) {
	if (editor) {
		const document = editor.document;
		const languageId = document.languageId;
		if (languageId === 'css') {
			editor.edit((builder) => {
				let firstLine = editor.document.lineAt(0);
				let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
				let range = new vscode.Range(firstLine.range.start, lastLine.range.end);
				builder.replace(
					range,
					SortCSS(editor.document.getText(), 'string', {
						sortMethod,
						addCategoryComments,
					})
				);
			});
		} else if (showMessages) {
			vscode.window.showErrorMessage(`${MESSAGES_PREFIX} The current file is not a CSS file.`);
		}
	} else if (showMessages) {
		vscode.window.showErrorMessage(`${MESSAGES_PREFIX} You do not have any file open.`);
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Sort CSS is loaded');

	// ============================
	// ==  Commands              ==
	// ============================
	const sortByCategory = vscode.commands.registerCommand('sortcss.sortByCategory', () => {
		const editor = vscode.window.activeTextEditor;
		Sort(editor, SortMethod.ByCategory, false);
	});
	const sortByCategoryWithComments = vscode.commands.registerCommand('sortcss.sortByCategoryWithComments', () => {
		const editor = vscode.window.activeTextEditor;
		Sort(editor, SortMethod.ByCategory, true);
	});
	const sortAlphabetically = vscode.commands.registerCommand('sortcss.sortAlphabetically', () => {
		const editor = vscode.window.activeTextEditor;
		Sort(editor, SortMethod.Alphabetical);
	});

	// ============================
	// ==  Events                ==
	// ============================
	const onSave = vscode.workspace.onDidSaveTextDocument((document) => {
		console.log('On save');

		if (vscode.workspace.getConfiguration().get<boolean>('sortCSS.sortOnSave') !== false) {
			const languageId = document.languageId;
			if (languageId === 'css') {
				const config = vscode.workspace
					.getConfiguration()
					.get<'Category' | 'Category with Comments' | 'Alphabetical'>('sortCSS.sortingMethod');

				writeFileSync(
					document.uri.fsPath,
					SortCSS(document.getText(), 'string', {
						sortMethod: config === 'Alphabetical' ? SortMethod.Alphabetical : SortMethod.ByCategory,
						addCategoryComments: config === 'Category with Comments' ? true : false,
					})
				);
			}
		}
	});

	context.subscriptions.push(sortByCategory, sortByCategoryWithComments, sortAlphabetically, onSave);
}

export function deactivate() {}
