import React from 'react';

const Debug: React.FC = () => {
  const [debugInfo, setDebugInfo] = React.useState<any>({});

  React.useEffect(() => {
    const info = {
      accessToken: localStorage.getItem('access_token'),
      userString: localStorage.getItem('user'),
      parsedUser: null,
      parseError: null as string | null
    };

    try {
      if (info.userString) {
        info.parsedUser = JSON.parse(info.userString);
      }
    } catch (error) {
      info.parseError = error instanceof Error ? error.toString() : 'Unknown error';
    }

    setDebugInfo(info);
  }, []);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Information</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-32">Access Token:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  debugInfo.accessToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugInfo.accessToken ? '✅ Present' : '❌ Missing'}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-32">User Data:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  debugInfo.userString ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugInfo.userString ? '✅ Present' : '❌ Missing'}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-32">Parse Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  debugInfo.parsedUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugInfo.parsedUser ? '✅ Valid JSON' : '❌ Invalid/Missing'}
                </span>
              </div>
            </div>
          </div>

          {debugInfo.accessToken && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Token</h2>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                {debugInfo.accessToken}
              </div>
            </div>
          )}

          {debugInfo.userString && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw User Data</h2>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                {debugInfo.userString}
              </div>
            </div>
          )}

          {debugInfo.parsedUser && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Parsed User Object</h2>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(debugInfo.parsedUser, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo.parseError && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-red-900 mb-4">Parse Error</h2>
              <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                {debugInfo.parseError}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-x-4">
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
              <button
                onClick={handleClearStorage}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear Storage & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;