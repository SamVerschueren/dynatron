'use strict';

const app = require('app');
const BrowserWindow = require('browser-window');
const path = require('path');

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being GC'd
let mainWindow;

function createMainWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
        resizable: true,
        icon: path.join(__dirname, 'src/assets/images/dynamodb.svg')
	});

    // win.maximize();
	win.loadUrl(`file://${__dirname}/index.html`);
    win.on('closed', onClosed);

    // Open the DevTools.
    win.openDevTools();

	return win;
}

function onClosed() {
	// deref the window
	// for multiple windows store them in an array
	mainWindow = null;
}

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', function () {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', function () {
	mainWindow = createMainWindow();
});
