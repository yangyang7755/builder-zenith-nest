import React, { useState, useEffect } from 'react';
import { networkService, type NetworkStatus } from '../services/networkService';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<NetworkStatus>(networkService.getStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = networkService.addListener(setStatus);
    return unsubscribe;
  }, []);

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (!status.isServerReachable) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    
    if (status.connectionQuality === 'poor') {
      return <Wifi className="h-4 w-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!status.isOnline) {
      return 'Offline';
    }
    
    if (!status.isServerReachable) {
      return 'Server Unavailable';
    }
    
    switch (status.connectionQuality) {
      case 'good': return 'Connected';
      case 'poor': return 'Slow Connection';
      default: return 'Checking...';
    }
  };

  const getStatusColor = () => {
    if (!status.isOnline || !status.isServerReachable) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    if (status.connectionQuality === 'poor') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    
    return 'bg-green-100 text-green-800 border-green-200';
  };

  // Only show if there are issues or user explicitly wants to see it
  const shouldShow = !status.isOnline || !status.isServerReachable || status.connectionQuality === 'poor' || showDetails;

  if (!shouldShow) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
        title="Network status"
      >
        {getStatusIcon()}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="ml-1">{getStatusText()}</span>
      
      {showDetails && status.isOnline && status.isServerReachable && (
        <button
          onClick={() => setShowDetails(false)}
          className="ml-2 text-gray-500 hover:text-gray-700"
          title="Hide details"
        >
          ×
        </button>
      )}
      
      {/* Tooltip with additional info */}
      {(status.isOnline && status.isServerReachable) && (
        <div className="ml-1 text-xs opacity-75">
          (Last checked: {status.lastChecked.toLocaleTimeString()})
        </div>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;
