import { app, BrowserWindow, BrowserView, ipcMain, Menu, MenuItem } from 'electron';

import GoogleSearch from './main/GoogleSearch'

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow: BrowserWindow

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });

  view = new BrowserView({ webPreferences: { preload: MAIN_PRELOAD_WEBPACK_ENTRY } })
  mainWindow.setBrowserView(view)

  view.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
  view.setAutoResize({ horizontal: true, vertical: true })
  view.webContents.loadURL(MAIN_WEBPACK_ENTRY)
  view.webContents.openDevTools();


  // Open the DevTools.
  mainWindow.webContents.openDevTools();


  const googleSearch = new GoogleSearch()

  await googleSearch.init()

  ipcMain.handle('search', async (e, { q }) => {

    const { data: { items } } = await googleSearch.search({ q })

    return items
  })


  ipcMain.handle('open', async (e, { url }) => {

    mainWindow.loadURL(url)
    mainWindow.webContents.focus()
  })

  ipcMain.handle('hide', async () => {

    hide()
    mainWindow.webContents.focus()
  })

};

let view: BrowserView


function show() {

  view.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
}

function hide() {
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
}

const menu = new Menu()

menu.append(new MenuItem({
  label: 'Electron',
  submenu: [{
    role: 'help',
    accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
    click: () => {

      show()
      view.webContents.focus()
    }
  }]
}))

Menu.setApplicationMenu(menu)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
