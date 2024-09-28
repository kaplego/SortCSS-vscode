import * as vscode from 'vscode';
import SortCSS, { SortMethod } from './SortCSS';

const MESSAGES_PREFIX = 'SortCSS:';

function Sort(editor: vscode.TextEditor | undefined, sortMethod = SortMethod.ByCategory, addCategoryComments = false) {
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
		} else {
			vscode.window.showErrorMessage(`${MESSAGES_PREFIX} The current file is not a CSS file.`);
		}
	} else {
		vscode.window.showErrorMessage(`${MESSAGES_PREFIX} You do not have any file open.`);
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Sort CSS is loaded');

	const sortByCategory = vscode.commands.registerCommand('sortcss.sortByCategory', () => {
		const editor = vscode.window.activeTextEditor;
		Sort(editor, SortMethod.ByCategory, false);
	});
	context.subscriptions.push(sortByCategory);

	const sortByCategoryWithComments = vscode.commands.registerCommand('sortcss.sortByCategoryWithComments', () => {
		const editor = vscode.window.activeTextEditor;
		Sort(editor, SortMethod.ByCategory, true);
	});
	context.subscriptions.push(sortByCategoryWithComments);

	const sortAlphabetically = vscode.commands.registerCommand('sortcss.sortAlphabetically', () => {
		const editor = vscode.window.activeTextEditor;
		Sort(editor, SortMethod.Alphabetical);
	});
	context.subscriptions.push(sortAlphabetically);
}

export function deactivate() {}
