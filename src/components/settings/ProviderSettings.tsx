import React, { useState, useEffect } from 'react';

const { gato: { settings } } = window;

interface ProviderSettings {
  github: {
    client_id: string;
    client_secret: string;
  };
  twitter: {
    client_id: string;
    client_secret: string;
  };
}

const ProviderSettingsPanel: React.FC = () => {
  const [githubClientId, setGithubClientId] = useState('');
  const [githubClientSecret, setGithubClientSecret] = useState('');
  const [twitterClientId, setTwitterClientId] = useState('');
  const [twitterClientSecret, setTwitterClientSecret] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load current settings
    const loadSettings = async () => {
      try {
        const githubSettings = await settings.getGitHubSettings();
        setGithubClientId(githubSettings.client_id || '');
        setGithubClientSecret(githubSettings.client_secret || '');
        
        const twitterSettings = await settings.getTwitterSettings();
        setTwitterClientId(twitterSettings.client_id || '');
        setTwitterClientSecret(twitterSettings.client_secret || '');
        
        const googleSettings = await settings.getYouTubeSettings();
        setGoogleClientId(googleSettings.client_id || '');
        setGoogleClientSecret(googleSettings.client_secret || '');
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
      await settings.setGitHubSettings({
        client_id: githubClientId,
        client_secret: githubClientSecret
      });
      
      await settings.setTwitterSettings({
        client_id: twitterClientId,
        client_secret: twitterClientSecret
      });
      
      await settings.setYouTubeSettings({
        key: '',
        client_id: googleClientId,
        client_secret: googleClientSecret
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Provider Settings</h2>
      
      {/* Google Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Google/YouTube Integration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your Google OAuth client ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={googleClientSecret}
              onChange={(e) => setGoogleClientSecret(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your Google OAuth client secret"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <p>
            <strong>How to get Google credentials:</strong>
          </p>
          <ol className="list-decimal list-inside mt-2 pl-2 space-y-1">
            <li>Go to <a href="https://console.developers.google.com/apis/credentials" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Google API Console</a></li>
            <li>Create a new OAuth client ID for "Desktop app"</li>
            <li>Enter any name for your application</li>
            <li>The redirect URI is handled automatically by the app</li>
            <li>Copy the Client ID and Client Secret and paste them here</li>
          </ol>
        </div>
      </div>
      
      {/* GitHub Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">GitHub Integration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={githubClientId}
              onChange={(e) => setGithubClientId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your GitHub OAuth client ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={githubClientSecret}
              onChange={(e) => setGithubClientSecret(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your GitHub OAuth client secret"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <p>
            <strong>How to get GitHub credentials:</strong>
          </p>
          <ol className="list-decimal list-inside mt-2 pl-2 space-y-1">
            <li>Go to <a href="https://github.com/settings/developers" target="_blank" rel="noopener" className="text-blue-600 hover:underline">GitHub Developer Settings</a></li>
            <li>Create a new OAuth App</li>
            <li>Set Homepage URL to <code className="bg-gray-200 px-1">http://localhost</code></li>
            <li>Set Authorization callback URL to <code className="bg-gray-200 px-1">http://localhost/github-callback</code></li>
            <li>Copy the Client ID and Client Secret and paste them here</li>
          </ol>
        </div>
      </div>
      
      {/* Twitter Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Twitter Integration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={twitterClientId}
              onChange={(e) => setTwitterClientId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your Twitter OAuth client ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={twitterClientSecret}
              onChange={(e) => setTwitterClientSecret(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your Twitter OAuth client secret"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <p>
            <strong>How to get Twitter credentials:</strong>
          </p>
          <ol className="list-decimal list-inside mt-2 pl-2 space-y-1">
            <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Twitter Developer Portal</a></li>
            <li>Create a new Project and App</li>
            <li>Set up User Authentication and enable OAuth 2.0</li>
            <li>Add <code className="bg-gray-200 px-1">http://localhost/twitter-callback</code> as a callback URL</li>
            <li>Copy the Client ID and Client Secret and paste them here</li>
          </ol>
        </div>
      </div>
      
      {/* Save Button */}
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
  );
};

export default ProviderSettingsPanel; 