import { BrowserWindow } from 'electron';
import { google } from 'googleapis';
import electronStore from 'electron-store';
import settings from '../Settings';

// Store reference to access tokens
const authStore = new electronStore({
  name: 'gato-accounts',
  encryptionKey: 'gato-accounts-secure'
});

class YouTubeAuth {
  private static instance: YouTubeAuth;
  private oauth2Client = null;
  
  constructor() {
    // Create OAuth client with defaults if settings are missing
    try {
      const clientId = settings.store.youtube?.client_id || '';
      const clientSecret = settings.store.youtube?.client_secret || '';
      
      console.log('YouTube Auth initialized with client ID:', clientId ? 'Present' : 'Missing');
      
      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://127.0.0.1:8888/google-callback'
      );
      
      // Set credentials if we have them
      const token = authStore.get('google-token');
      const refreshToken = authStore.get('google-refresh-token');
      
      if (token) {
        this.oauth2Client.setCredentials({
          access_token: token,
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Error initializing YouTube Auth:', error);
      // Create a dummy client to prevent null errors
      this.oauth2Client = new google.auth.OAuth2('', '', 'http://127.0.0.1:8888/google-callback');
    }
  }
  
  static async getInstance() {
    if (!YouTubeAuth.instance) {
      YouTubeAuth.instance = new YouTubeAuth();
    }
    return YouTubeAuth.instance;
  }
  
  isAuthenticated(): boolean {
    try {
      return !!authStore.get('google-token');
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
  
  async getAuthClient() {
    // Update client ID and secret in case they changed in settings
    const clientId = settings.store.youtube?.client_id || '';
    const clientSecret = settings.store.youtube?.client_secret || '';
    
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://127.0.0.1:8888/google-callback'
    );
    
    const token = authStore.get('google-token');
    const refreshToken = authStore.get('google-refresh-token');
    
    if (token) {
      this.oauth2Client.setCredentials({
        access_token: token,
        refresh_token: refreshToken
      });
    }
    
    return this.oauth2Client;
  }
  
  signOut() {
    // This is now handled by AccountsManager
    console.log('YouTubeAuth.signOut(): This method is deprecated. Use AccountsManager.signOut() instead.');
  }
  
  // This is kept for backward compatibility, but uses AccountsManager internally
  async authenticate(): Promise<boolean> {
    console.log('YouTubeAuth.authenticate(): This method is deprecated. Use AccountsManager.authenticate() instead.');
    return false;
  }
}

export default YouTubeAuth; 