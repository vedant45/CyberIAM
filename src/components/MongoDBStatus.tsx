'use client';

import { useState, useEffect } from 'react';

export default function MongoDBStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/mongodb');
      const data = await response.json();
      setIsConnected(data.status === 'connected');
    } catch {
      setError('Failed to check connection status');
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mongodb', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to MongoDB');
      }
      
      setIsConnected(data.status === 'connected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to MongoDB');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">MongoDB Connection Status</h2>
        
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2">
            <span className={`h-3 w-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        {!isConnected && (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-md text-white
              ${isLoading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'}
            `}
          >
            {isLoading ? 'Connecting...' : 'Connect to MongoDB'}
          </button>
        )}
      </div>
    </div>
  );
}