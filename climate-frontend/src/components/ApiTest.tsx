import React from 'react';
import { api } from '../lib/api';

const ApiTest: React.FC = () => {
  const [status, setStatus] = React.useState<string>('Testing...');
  const [apiData, setApiData] = React.useState<any>(null);

  React.useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      // Test basic API connection
      const healthResponse = await api.get('/health');
      setStatus(`✅ Backend Connected (${healthResponse.status})`);
      
      // Try to get disasters data
      const disastersResponse = await api.get('/disasters/');
      setApiData({
        disasters: disastersResponse.data.length || 0,
        health: healthResponse.data
      });
    } catch (error: any) {
      console.error('API Test Error:', error);
      if (error.code === 'ERR_NETWORK') {
        setStatus('❌ Backend Not Running (Check http://localhost:8000)');
      } else {
        setStatus(`❌ API Error: ${error.response?.status || error.message}`);
      }
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">Backend Integration Status</h3>
      <p className="text-sm text-blue-700 mb-2">{status}</p>
      {apiData && (
        <div className="text-xs text-blue-600">
          <p>Disasters in DB: {apiData.disasters}</p>
          <p>Health Check: {JSON.stringify(apiData.health)}</p>
        </div>
      )}
      <button
        onClick={testApiConnection}
        className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
      >
        Test Again
      </button>
    </div>
  );
};

export default ApiTest;