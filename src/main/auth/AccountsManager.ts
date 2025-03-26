import { BrowserWindow, net } from 'electron';
import electronStore from 'electron-store';
import { IAccountsManager, IAuthProviderStatus, ProviderType } from '../../interfaces';
import { handleApi } from '../../utils/bridge';
import YouTubeAuth from './YouTubeAuth';
import settings from '../Settings';
import * as crypto from 'crypto';
import * as http from 'http';

// Secure store for authentication tokens and user info
const authStore = new electronStore({
  name: 'gato-accounts',
  encryptionKey: 'gato-accounts-secure'
});

// Google OAuth configuration
const GOOGLE_CLIENT_ID = ''; // Will be loaded from settings
const GOOGLE_REDIRECT_URI = 'http://127.0.0.1:8888/google-callback';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = '';
const GITHUB_REDIRECT_URI = 'http://localhost/github-callback';

// Twitter OAuth configuration
const TWITTER_CLIENT_ID = '';
const TWITTER_REDIRECT_URI = 'http://localhost/twitter-callback';

class AccountsManager implements IAccountsManager {
  private static instance: AccountsManager;
  private youtubeAuth: YouTubeAuth;
  private server: http.Server | null = null;
  private authPromiseResolve: ((value: boolean) => void) | null = null;
  private authPromiseReject: ((reason: any) => void) | null = null;
  
  constructor() {
    // Will be initialized in init()
    this.youtubeAuth = null;
  }
  
  async init() {
    try {
      // Initialize providers
      console.log('Initializing YouTube Auth...');
      this.youtubeAuth = await YouTubeAuth.getInstance();
      console.log('YouTube Auth initialized');
      
      // Register API with IPC
      console.log('Registering accounts API...');
      this.registerAPI();
      console.log('Accounts API registered');
    } catch (error) {
      console.error('Error initializing AccountsManager:', error);
      // Create a placeholder to prevent null errors
      this.youtubeAuth = await YouTubeAuth.getInstance();
      
      // Still register API even if initialization had errors
      this.registerAPI();
    }
  }
  
  private registerAPI() {
    try {
      // Create API object with methods that will be exposed via IPC
      const api: IAccountsManager = {
        getProviders: async (...args) => this.getProviders(...args),
        authenticate: async (provider) => this.authenticate(provider),
        signOut: async (provider) => this.signOut(provider),
        signOutAll: async () => this.signOutAll()
      };
      
      // Register the API with the IPC system
      console.log('Registering accounts API with methods:', Object.keys(api));
      handleApi<IAccountsManager>('accounts', api);
      console.log('Accounts API registered successfully');
    } catch (error) {
      console.error('Failed to register accounts API:', error);
    }
  }
  
  static async getInstance() {
    if (!AccountsManager.instance) {
      AccountsManager.instance = new AccountsManager();
      await AccountsManager.instance.init();
    }
    return AccountsManager.instance;
  }
  
  async getProviders(): Promise<IAuthProviderStatus[]> {
    try {
      console.log('Getting provider list...');
      const providers: IAuthProviderStatus[] = [];
      
      // Google/YouTube Provider
      console.log('Adding Google provider...');
      const googleInfo = authStore.get('google-info') as any || {};
      const isGoogleAuthenticated = !!authStore.get('google-token');
      providers.push({
        provider: 'google',
        isAuthenticated: isGoogleAuthenticated,
        displayName: googleInfo.displayName || 'Google User',
        email: googleInfo.email,
        avatarUrl: googleInfo.avatarUrl
      });
      
      // GitHub Provider
      console.log('Adding GitHub provider...');
      const githubInfo = authStore.get('github-info') as any || {};
      providers.push({
        provider: 'github',
        isAuthenticated: !!authStore.get('github-token'),
        displayName: githubInfo.displayName || 'GitHub User',
        email: githubInfo.email,
        avatarUrl: githubInfo.avatarUrl
      });
      
      // Twitter Provider
      console.log('Adding Twitter provider...');
      const twitterInfo = authStore.get('twitter-info') as any || {};
      providers.push({
        provider: 'twitter',
        isAuthenticated: !!authStore.get('twitter-token'),
        displayName: twitterInfo.displayName || 'Twitter User',
        email: twitterInfo.email,
        avatarUrl: twitterInfo.avatarUrl
      });
      
      console.log('Provider list complete:', providers);
      return providers;
    } catch (error) {
      console.error('Error getting providers:', error);
      // Return default providers on error
      return [
        { provider: 'google', isAuthenticated: false, displayName: 'Google User' },
        { provider: 'github', isAuthenticated: false, displayName: 'GitHub User' },
        { provider: 'twitter', isAuthenticated: false, displayName: 'Twitter User' }
      ];
    }
  }
  
  async authenticate(provider: ProviderType): Promise<boolean> {
    switch (provider) {
      case 'google':
        return this.authenticateGoogle();
      case 'github':
        return this.authenticateGitHub();
      case 'twitter':
        return this.authenticateTwitter();
      default:
        console.error(`Unknown provider: ${provider}`);
        return false;
    }
  }
  
  async signOut(provider: ProviderType): Promise<void> {
    switch (provider) {
      case 'google':
        authStore.delete('google-token');
        authStore.delete('google-refresh-token');
        authStore.delete('google-info');
        break;
      case 'github':
        authStore.delete('github-token');
        authStore.delete('github-info');
        break;
      case 'twitter':
        authStore.delete('twitter-token');
        authStore.delete('twitter-info');
        break;
      default:
        console.error(`Unknown provider: ${provider}`);
    }
  }
  
  async signOutAll(): Promise<void> {
    authStore.delete('google-token');
    authStore.delete('google-refresh-token');
    authStore.delete('google-info');
    authStore.delete('github-token');
    authStore.delete('github-info');
    authStore.delete('twitter-token');
    authStore.delete('twitter-info');
  }
  
  // Generate a random string for PKCE
  private generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .slice(0, length);
  }
  
  // Generate code challenge from code verifier
  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    return Buffer.from(hash)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  // Create a local server to handle OAuth callback
  private createCallbackServer(codeVerifier: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authPromiseResolve = resolve;
      this.authPromiseReject = reject;
      
      if (this.server) {
        this.server.close();
      }
      
      this.server = http.createServer(async (req, res) => {
        try {
          const url = new URL(`http://localhost${req.url}`);
          const code = url.searchParams.get('code');
          
          // Send response to browser
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <h1>Authentication Successful</h1>
                <p>You can close this window and return to the application.</p>
                <script>window.close();</script>
              </body>
            </html>
          `);
          
          if (code && url.pathname === '/google-callback') {
            // Exchange code for tokens
            const googleClientId = settings.store.youtube?.client_id || GOOGLE_CLIENT_ID;
            
            if (!googleClientId) {
              console.error('Google client ID not configured');
              if (this.authPromiseReject) {
                this.authPromiseReject(new Error('Google client ID not configured'));
              }
              return;
            }
            
            try {
              const tokenResponse = await this.exchangeCodeForTokens(code, codeVerifier, googleClientId);
              
              if (tokenResponse.access_token) {
                // Store tokens
                authStore.set('google-token', tokenResponse.access_token);
                if (tokenResponse.refresh_token) {
                  authStore.set('google-refresh-token', tokenResponse.refresh_token);
                }
                
                // Get user info
                const userInfo = await this.fetchGoogleUserInfo(tokenResponse.access_token);
                
                authStore.set('google-info', {
                  displayName: userInfo.name || 'Google User',
                  email: userInfo.email || '',
                  avatarUrl: userInfo.picture || ''
                });
                
                // Close server after successful authentication
                this.server.close();
                this.server = null;
                
                if (this.authPromiseResolve) {
                  this.authPromiseResolve(true);
                }
              } else {
                console.error('Failed to get access token');
                if (this.authPromiseReject) {
                  this.authPromiseReject(new Error('Failed to get access token'));
                }
              }
            } catch (error) {
              console.error('Error exchanging code for tokens:', error);
              if (this.authPromiseReject) {
                this.authPromiseReject(error);
              }
            }
          }
        } catch (error) {
          console.error('Error handling callback:', error);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Authentication Error</h1><p>Please try again.</p></body></html>');
          
          if (this.authPromiseReject) {
            this.authPromiseReject(error);
          }
        }
      });
      
      this.server.on('error', (err) => {
        console.error('Server error:', err);
        if (this.authPromiseReject) {
          this.authPromiseReject(err);
        }
      });
      
      this.server.listen(8888, '127.0.0.1', () => {
        console.log('Callback server started on http://127.0.0.1:8888');
      });
    });
  }
  
  // Exchange authorization code for tokens
  private async exchangeCodeForTokens(code: string, codeVerifier: string, clientId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        url: 'https://oauth2.googleapis.com/token'
      });
      
      request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      request.on('response', (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        response.on('end', () => {
          try {
            if (response.statusCode === 200) {
              const tokenData = JSON.parse(data);
              resolve(tokenData);
            } else {
              reject(new Error(`Token exchange failed: ${response.statusCode} ${data}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', GOOGLE_REDIRECT_URI);
      params.append('code_verifier', codeVerifier);
      
      request.write(params.toString());
      request.end();
    });
  }
  
  // Fetch user information from Google
  private async fetchGoogleUserInfo(accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = net.request({
        method: 'GET',
        url: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });
      
      request.setHeader('Authorization', `Bearer ${accessToken}`);
      
      request.on('response', (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        response.on('end', () => {
          try {
            if (response.statusCode === 200) {
              const userInfo = JSON.parse(data);
              resolve(userInfo);
            } else {
              reject(new Error(`User info request failed: ${response.statusCode} ${data}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.end();
    });
  }
  
  // Google authentication with PKCE for Desktop apps
  private async authenticateGoogle(): Promise<boolean> {
    try {
      const googleClientId = settings.store.youtube?.client_id || GOOGLE_CLIENT_ID;
      
      if (!googleClientId) {
        console.error('Google client ID not configured');
        return false;
      }
      
      // Generate PKCE code verifier and challenge
      const codeVerifier = this.generateRandomString(64);
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      
      // Start local server to handle callback
      const serverPromise = this.createCallbackServer(codeVerifier);
      
      // Create auth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', googleClientId);
      authUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube.readonly');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('access_type', 'offline');
      // Force approval prompt to ensure we get a refresh token
      authUrl.searchParams.append('prompt', 'consent');
      
      // Open browser window
      const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: true,
        webPreferences: {
          nodeIntegration: false
        }
      });
      
      // Open URL in window
      await authWindow.loadURL(authUrl.toString());
      
      // Wait for server to capture the callback
      try {
        const result = await serverPromise;
        authWindow.close();
        return result;
      } catch (error) {
        authWindow.close();
        throw error;
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      return false;
    }
  }
  
  private async authenticateGitHub(): Promise<boolean> {
    const githubClientId = settings.store.github?.client_id || GITHUB_CLIENT_ID;
    
    if (!githubClientId) {
      console.error('GitHub client ID not configured');
      return false;
    }
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=user:email`;
    
    // Create auth window
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false
      }
    });
    
    // Handle the callback
    win.webContents.on('will-redirect', async (event, url) => {
      if (url.startsWith(GITHUB_REDIRECT_URI)) {
        event.preventDefault();
        const urlParams = new URL(url).searchParams;
        const code = urlParams.get('code');
        
        if (code) {
          try {
            // In a real implementation, you would:
            // 1. Exchange the code for an access token
            // 2. Use the token to fetch user info
            // 3. Store the token and user info
            
            // For this example, we'll just simulate success
            authStore.set('github-token', 'mock-token');
            authStore.set('github-info', {
              displayName: 'GitHub User',
              email: 'github@example.com',
              avatarUrl: ''
            });
            
            win.close();
            return true;
          } catch (error) {
            console.error('Error authenticating with GitHub:', error);
            win.close();
            return false;
          }
        }
      }
    });
    
    // Load the auth URL
    await win.loadURL(authUrl);
    return false; // Will be updated by the redirect handler
  }
  
  private async authenticateTwitter(): Promise<boolean> {
    const twitterClientId = settings.store.twitter?.client_id || TWITTER_CLIENT_ID;
    
    if (!twitterClientId) {
      console.error('Twitter client ID not configured');
      return false;
    }
    
    // This is a placeholder for Twitter OAuth 2.0 implementation
    // Twitter now uses OAuth 2.0 which would require similar PKCE flow as Google
    console.log('Twitter authentication not fully implemented');
    
    return false;
  }
}

export default AccountsManager; 