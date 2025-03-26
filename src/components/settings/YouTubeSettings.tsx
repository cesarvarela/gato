import React, { useState, useEffect } from 'react';

const { gato: { youtube, settings } } = window;

interface YouTubeSettings {
  key: string;
  client_id: string;
  client_secret: string;
}

const YouTubeSettingsPanel: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load current settings
    const loadSettings = async () => {
      try {
        const youtubeSettings = await settings.getYouTubeSettings();
        setApiKey(youtubeSettings.key || '');
        setClientId(youtubeSettings.client_id || '');
        setClientSecret(youtubeSettings.client_secret || '');
        
        // Check auth status
        const authStatus = await youtube.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await settings.setYouTubeSettings({
        key: apiKey,
        client_id: clientId,
        client_secret: clientSecret
      });
      
      setSaveMessage('Settings saved successfully');
      
      // Check if we need to restart for settings to take effect
      const needsRestart = await settings.needsRestart();
      if (needsRestart) {
        setSaveMessage('Settings saved. Please restart the application for changes to take effect.');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = async () => {
    try {
      const success = await youtube.authenticate();
      if (success) {
        setIsAuthenticated(true);
        setSaveMessage('Authentication successful');
      } else {
        setSaveMessage('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setSaveMessage('Authentication error');
    }
  };

  const handleLogout = async () => {
    try {
      await youtube.signOut();
      setIsAuthenticated(false);
      setSaveMessage('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      setSaveMessage('Failed to sign out');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">YouTube Integration Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded ${isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
            {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </div>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={!clientId || !clientSecret}
            >
              Sign In to YouTube
            </button>
          )}
        </div>
        {!clientId && !clientSecret && (
          <p className="mt-2 text-sm text-gray-600">
            Please enter your OAuth credentials to enable sign-in
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            YouTube API Key (Optional)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your YouTube API key"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used for basic YouTube operations without user authentication
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OAuth Client ID
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your OAuth client ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OAuth Client Secret
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your OAuth client secret"
          />
        </div>
        
        <div className="pt-4">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          
          {saveMessage && (
            <p className="mt-2 text-sm text-gray-700">{saveMessage}</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="text-md font-semibold mb-2">How to get OAuth credentials</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Go to the <a href="https://console.developers.google.com/" target="_blank" className="text-blue-600 hover:underline">Google Developer Console</a></li>
          <li>Create a new project</li>
          <li>Enable the YouTube Data API v3</li>
          <li>Go to Credentials and create OAuth client ID credentials</li>
          <li>Set the application type to "Desktop app"</li>
          <li>For redirect URI, use "http://localhost"</li>
          <li>Copy the Client ID and Client Secret and paste them here</li>
        </ol>
      </div>
    </div>
  );
};

export default YouTubeSettingsPanel; 