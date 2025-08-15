import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Server } from 'lucide-react';

interface ApiConnectionStatus {
  isConnected: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const ApiConnectionStatusBanner: React.FC = () => {
  const [status, setStatus] = useState<ApiConnectionStatus>({
    isConnected: false,
    lastChecked: null,
    error: null,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const checkApiConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      
      const isConnected = response.ok;
      setStatus({
        isConnected,
        lastChecked: new Date(),
        error: isConnected ? null : `HTTP ${response.status}`,
      });
      
      // Only show banner if there are connection issues
      setShowBanner(!isConnected);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage,
      });
      setShowBanner(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkApiConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Backend Server Unavailable
            </p>
            <p className="text-xs text-yellow-700">
              Some features may not work properly. The app is running in demo mode.
              {status.error && ` (${status.error})`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status.lastChecked && (
            <span className="text-xs text-yellow-600">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={checkApiConnection}
            disabled={isChecking}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded hover:bg-yellow-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Retry'}
          </button>
          
          <button
            onClick={() => setShowBanner(false)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export const ApiConnectionIndicator: React.FC = () => {
  const [status, setStatus] = useState<ApiConnectionStatus>({
    isConnected: false,
    lastChecked: null,
    error: null,
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000),
        });
        
        setStatus({
          isConnected: response.ok,
          lastChecked: new Date(),
          error: response.ok ? null : `HTTP ${response.status}`,
        });
      } catch (error) {
        setStatus({
          isConnected: false,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    return status.isConnected 
      ? 'text-green-500' 
      : 'text-red-500';
  };

  const getStatusIcon = () => {
    return status.isConnected 
      ? <CheckCircle className="h-4 w-4" />
      : <Server className="h-4 w-4" />;
  };

  return (
    <div className={`inline-flex items-center space-x-1 ${getStatusColor()}`} title={status.error || 'API Connected'}>
      {getStatusIcon()}
      <span className="text-xs">
        {status.isConnected ? 'API' : 'Demo'}
      </span>
    </div>
  );
};

export default ApiConnectionStatusBanner;
