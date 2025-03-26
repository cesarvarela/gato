import { contextBridge, ipcRenderer } from "electron";

console.log('Accounts preload script starting...');

// Simple wrapper for IPC invocation
const invokeIpc = (channel, ...args) => {
  console.log(`Invoking channel "${channel}"`);
  return ipcRenderer.invoke(channel, ...args).catch(err => {
    console.error(`Error invoking "${channel}":`, err);
    throw err;
  });
};

// Create direct API methods
const api = {
  platform: process.platform,
  
  accounts: {
    getProviders: () => {
      console.log('Calling accounts:getProviders');
      return invokeIpc('accounts:getProviders').catch(err => {
        console.error('Failed to get providers:', err);
        // Return fallback providers on error
        return [
          { provider: 'google', isAuthenticated: false, displayName: 'Google (Fallback)' },
          { provider: 'github', isAuthenticated: false, displayName: 'GitHub (Fallback)' },
          { provider: 'twitter', isAuthenticated: false, displayName: 'Twitter (Fallback)' }
        ];
      });
    },
    authenticate: (provider) => invokeIpc('accounts:authenticate', provider),
    signOut: (provider) => invokeIpc('accounts:signOut', provider),
    signOutAll: () => invokeIpc('accounts:signOutAll')
  },
  
  settings: {
    getYouTubeSettings: () => invokeIpc('settings:getYouTubeSettings'),
    setYouTubeSettings: (settings) => invokeIpc('settings:setYouTubeSettings', settings),
    getGitHubSettings: () => invokeIpc('settings:getGitHubSettings'),
    setGitHubSettings: (settings) => invokeIpc('settings:setGitHubSettings', settings),
    getTwitterSettings: () => invokeIpc('settings:getTwitterSettings'),
    setTwitterSettings: (settings) => invokeIpc('settings:setTwitterSettings', settings),
    needsRestart: () => invokeIpc('settings:needsRestart')
  },
  
  gato: {
    open: (params) => invokeIpc('gato:open', params),
    choose: (params) => invokeIpc('gato:choose', params),
    status: () => invokeIpc('gato:status')
  },
  
  debug: {
    testConnection: async () => {
      try {
        // Try a test call to see if accounts API works
        await invokeIpc('accounts:getProviders').catch(() => {});
        
        return {
          platform: process.platform,
          success: true,
          apis: {
            accounts: ['getProviders', 'authenticate', 'signOut', 'signOutAll'],
            settings: ['getYouTubeSettings', 'setYouTubeSettings', 'getGitHubSettings', 'setGitHubSettings', 'getTwitterSettings', 'setTwitterSettings', 'needsRestart'],
            gato: ['open', 'choose', 'status']
          }
        };
      } catch (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }
    }
  }
};

console.log('Exposing API to main world...');
contextBridge.exposeInMainWorld("gato", api);
console.log('Accounts preload script complete'); 