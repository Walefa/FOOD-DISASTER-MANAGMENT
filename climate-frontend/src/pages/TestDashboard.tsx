import React from 'react';

const TestDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          This is a simple test dashboard to verify the app is working.
        </p>
        
        <div className="mt-4 space-y-2">
          <p><strong>Token exists:</strong> {localStorage.getItem('access_token') ? 'Yes' : 'No'}</p>
          <p><strong>User data:</strong> {localStorage.getItem('user') ? 'Yes' : 'No'}</p>
          {localStorage.getItem('user') && (
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <pre className="text-sm text-gray-800">
                {JSON.stringify(JSON.parse(localStorage.getItem('user') || '{}'), null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Status</h3>
            <p className="text-2xl font-bold text-blue-600">Online</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">System</h3>
            <p className="text-2xl font-bold text-green-600">Ready</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Features</h3>
            <p className="text-2xl font-bold text-purple-600">6/8</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;