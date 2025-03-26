import React, { useState, useEffect } from 'react';
import { IAuthProviderStatus, ProviderType } from '../../interfaces';
import ProviderSettingsPanel from './ProviderSettings';

const { gato: { accounts } } = window;

// Icon components for providers
const GoogleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const getProviderIcon = (provider: ProviderType) => {
  switch (provider) {
    case 'google':
      return <GoogleIcon />;
    case 'github':
      return <GitHubIcon />;
    case 'twitter':
      return <TwitterIcon />;
    default:
      return null;
  }
};

const getProviderName = (provider: ProviderType) => {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'github':
      return 'GitHub';
    case 'twitter':
      return 'Twitter';
    default:
      return provider;
  }
};

const AccountsPage: React.FC = () => {
  const [providers, setProviders] = useState<IAuthProviderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Run debug check on load
  useEffect(() => {
    const runDebugTest = async () => {
      try {
        if (window.gato?.debug && typeof window.gato.debug.testConnection === 'function') {
          const result = await window.gato.debug.testConnection();
          console.log('Debug connection test result:', result);
          setDebugInfo(result);
          
          if (!result.success) {
            setError('API connection test failed');
          }
        } else {
          console.warn('Debug method not available');
        }
      } catch (err) {
        console.error('Error running debug test:', err);
      }
    };
    
    runDebugTest();
  }, []);
  
  // Create fallback providers if needed
  const createFallbackProviders = () => {
    console.log('Creating fallback providers');
    return [
      { provider: 'google' as ProviderType, isAuthenticated: false, displayName: 'Google (Fallback)' },
      { provider: 'github' as ProviderType, isAuthenticated: false, displayName: 'GitHub (Fallback)' },
      { provider: 'twitter' as ProviderType, isAuthenticated: false, displayName: 'Twitter (Fallback)' }
    ];
  };
  
  // Load accounts data
  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Accounts API:', accounts);
      console.log('Attempting to get providers...');
      
      if (!accounts || typeof accounts.getProviders !== 'function') {
        console.error('Accounts API not properly initialized:', accounts);
        setError('Accounts API not available. Using fallback providers.');
        setProviders(createFallbackProviders());
        setIsLoading(false);
        return;
      }
      
      const providerList = await accounts.getProviders();
      console.log('Provider list received:', providerList);
      
      if (!providerList || !Array.isArray(providerList) || providerList.length === 0) {
        console.warn('No providers returned or invalid response');
        setProviders(createFallbackProviders());
      } else {
        setProviders(providerList);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load account information: ' + (err?.message || err));
      // Use fallback providers on error
      setProviders(createFallbackProviders());
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadAccounts();
  }, []);
  
  // Handle sign in/out
  const handleSignIn = async (provider: ProviderType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await accounts.authenticate(provider);
      if (success) {
        await loadAccounts();
      } else {
        setError(`Failed to authenticate with ${getProviderName(provider)}`);
      }
    } catch (err) {
      console.error(`Error authenticating with ${provider}:`, err);
      setError(`Error connecting to ${getProviderName(provider)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async (provider: ProviderType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await accounts.signOut(provider);
      await loadAccounts();
    } catch (err) {
      console.error(`Error signing out of ${provider}:`, err);
      setError(`Error disconnecting from ${getProviderName(provider)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOutAll = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await accounts.signOutAll();
      await loadAccounts();
    } catch (err) {
      console.error('Error signing out of all accounts:', err);
      setError('Error disconnecting all accounts');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showSettings) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Provider Settings</h1>
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Accounts
          </button>
        </div>
        <ProviderSettingsPanel />
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Connected Accounts</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Provider Settings
          </button>
          {providers.some(p => p.isAuthenticated) && (
            <button
              onClick={handleSignOutAll}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Sign Out All
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          {debugInfo && (
            <div className="mt-2 text-xs">
              <div>Platform: {debugInfo.platform}</div>
              <div>APIs available: 
                {debugInfo.apis?.accounts && ` Accounts(${debugInfo.apis.accounts.join(', ')})`}
                {debugInfo.apis?.settings && ` Settings(${debugInfo.apis.settings.join(', ')})`}
              </div>
            </div>
          )}
        </div>
      )}
      
      {isLoading && providers.length === 0 ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading accounts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={provider.provider}
              className="border rounded-lg shadow-sm overflow-hidden bg-white"
            >
              <div className="p-5 border-b bg-gray-50">
                <div className="flex items-center">
                  <span className={`text-${provider.provider === 'google' ? 'blue' : provider.provider === 'github' ? 'gray' : 'blue'}-500 mr-3`}>
                    {getProviderIcon(provider.provider)}
                  </span>
                  <h3 className="text-lg font-semibold">
                    {getProviderName(provider.provider)}
                  </h3>
                </div>
              </div>
              
              <div className="p-5">
                {provider.isAuthenticated ? (
                  <div>
                    <div className="flex items-center mb-4">
                      {provider.avatarUrl ? (
                        <img 
                          src={provider.avatarUrl} 
                          alt={provider.displayName} 
                          className="w-10 h-10 rounded-full mr-3" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 text-xl font-semibold">
                            {provider.displayName?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{provider.displayName}</p>
                        {provider.email && (
                          <p className="text-sm text-gray-500">{provider.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSignOut(provider.provider)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4 text-gray-600">
                      Connect your {getProviderName(provider.provider)} account to access additional features.
                    </p>
                    
                    <button
                      onClick={() => handleSignIn(provider.provider)}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 rounded text-white disabled:bg-gray-400
                        ${provider.provider === 'google' ? 'bg-blue-600 hover:bg-blue-700' : 
                          provider.provider === 'github' ? 'bg-gray-800 hover:bg-gray-900' : 
                          'bg-blue-400 hover:bg-blue-500'}`}
                    >
                      Connect {getProviderName(provider.provider)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-10 p-5 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3">About Connected Accounts</h2>
        <p className="text-gray-600 mb-4">
          Connecting your accounts allows Gato Browser to provide seamless integration with various services.
          Your credentials are securely stored and are only used to access the respective services.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded shadow-sm">
            <h3 className="font-medium mb-2 flex items-center">
              <span className="text-blue-500 mr-2"><GoogleIcon /></span>
              Google
            </h3>
            <p className="text-sm text-gray-600">
              Access YouTube videos without distractions and manage your Google content.
            </p>
          </div>
          <div className="p-3 bg-white rounded shadow-sm">
            <h3 className="font-medium mb-2 flex items-center">
              <span className="text-gray-800 mr-2"><GitHubIcon /></span>
              GitHub
            </h3>
            <p className="text-sm text-gray-600">
              Browse GitHub repositories with a cleaner interface and quick access to your projects.
            </p>
          </div>
          <div className="p-3 bg-white rounded shadow-sm">
            <h3 className="font-medium mb-2 flex items-center">
              <span className="text-blue-400 mr-2"><TwitterIcon /></span>
              Twitter
            </h3>
            <p className="text-sm text-gray-600">
              View Twitter content in a distraction-free environment without ads or recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage; 