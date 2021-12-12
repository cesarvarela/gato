import electron from 'electron';
import Reader from './main/Reader';
import GoogleSearch from './main/GoogleSearch';
import Menu from './main/Menu';
import Windows from './main/Windows';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  electron.app.quit();
}

electron.app.on('ready', async () => {

  const menu = await Menu.getInstance()
  await Windows.getInstance()
  await GoogleSearch.create()
  await Reader.create()

  menu.emit('newWindow')
});

electron.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

electron.app.on('activate', async () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {

    const menu = await Menu.getInstance()
    menu.emit('newWindow')
  }
});