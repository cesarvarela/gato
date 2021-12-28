import electron from 'electron';
import { download } from 'electron-dl'
import Gato from './main/Gato';
import unhandled from 'electron-unhandled';
import { openNewGitHubIssue, debugInfo } from 'electron-util';

unhandled({
  showDialog: true,
  reportButton: error => {
    openNewGitHubIssue({
      user: 'cesarvarela',
      repo: 'gato',
      body: `\`\`\`\n${error.stack}\n\`\`\`\n\n---\n\n${debugInfo()}`
    });
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  electron.app.quit();
}

//TODO: check this
electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: 'gato',
    privileges: {
      bypassCSP: true,
      stream: true, standard: true, supportFetchAPI: true, allowServiceWorkers: true
    }
  }
])

electron.app.on('ready', async () => {

  electron.ipcMain.on('download-button', async (event, { url }) => {
    const window = electron.BrowserWindow.getFocusedWindow();
    console.log('download', await download(window, url));
  });

  electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      electron.app.quit();
    }
  });

  electron.app.on('activate', async () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {

      await Gato.create({ q: 'gato://home' })
    }
  });

  electron.app.on('quit', () => {
    // TODO: this might not be necessary
    Object.keys(Gato.gatos).forEach(id => Gato.gatos[id] && Gato.gatos[id].close())
    electron.app.quit();
  })

  await Gato.setup()

  await Gato.create({ q: 'gato://home' })
});

