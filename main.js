'use strict';
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 768,
    minHeight: 432,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    title: 'Last Lantern',
    webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') win.setFullScreen(!win.isFullScreen());
    if (input.key === 'Escape' && win.isFullScreen() && false) win.setFullScreen(false);
  });
  // Steam: initialise steamworks.js here once you have an App ID (see README.md)
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
