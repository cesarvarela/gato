import { ipcMain } from 'electron';

// Debug function to log all registered IPC handlers
const logIpcHandlers = () => {
  console.log('=== REGISTERED IPC HANDLERS ===');
  const channels = Object.keys(ipcMain.eventNames());
  if (channels.length === 0) {
    console.log('No IPC handlers registered or unable to list them');
  } else {
    channels.forEach(channel => {
      console.log(`- ${channel}`);
    });
  }
  console.log('===============================');
};

logIpcHandlers(); 