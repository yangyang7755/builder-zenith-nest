import React, { useState, useEffect } from 'react';
import { storageValidationService } from '../services/storageValidationService';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle, RefreshCw, Database } from 'lucide-react';

interface StorageStatus {
  isHealthy: boolean;
  lastChecked: Date | null;
  summary: {
    reviewsCount: number;
    followersCount: number;
    followingCount: number;
    savedActivitiesCount: number;
    chatMessagesValidated: boolean;
  };
  errors: string[];
  warnings: string[];
}

export const StorageStatusIndicator: React.FC = () => {
  const { user } = useAuth();
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    isHealthy: true,
    lastChecked: null,
    summary: {
      reviewsCount: 0,
      followersCount: 0,
      followingCount: 0,
      savedActivitiesCount: 0,
      chatMessagesValidated: false,
    },
    errors: [],
    warnings: [],
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkStorageHealth();
    }
  }, [user?.id]);

  const checkStorageHealth = async () => {
    if (!user?.id) return;
    
    setIsChecking(true);
    try {
      const validation = await storageValidationService.validateUserDataPersistence(user.id);
      
      setStorageStatus({
        isHealthy: validation.isValid,
        lastChecked: new Date(),
        summary: validation.summary,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    } catch (error) {
      console.error('Storage health check failed:', error);
      setStorageStatus(prev => ({
        ...prev,
        isHealthy: false,
        lastChecked: new Date(),
        errors: ['Storage health check failed'],
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const generateReport = async () => {
    if (!user?.id) return;
    
    try {
      const report = await storageValidationService.generateStorageHealthReport(user.id);
      
      // Create and download the report
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `storage-health-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Storage Status</h3>
          {storageStatus.isHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={checkStorageHealth}
            disabled={isChecking}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check'}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span className={`px-2 py-1 rounded-full ${
            storageStatus.isHealthy 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {storageStatus.isHealthy ? 'All Data Persistent' : 'Storage Issues'}
          </span>
          
          {storageStatus.lastChecked && (
            <span>
              Last checked: {storageStatus.lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-900">Stored Data</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Reviews: {storageStatus.summary.reviewsCount}</div>
                <div>Followers: {storageStatus.summary.followersCount}</div>
                <div>Following: {storageStatus.summary.followingCount}</div>
                <div>Saved Activities: {storageStatus.summary.savedActivitiesCount}</div>
                <div>Chat Messages: {storageStatus.summary.chatMessagesValidated ? '✓' : '✗'}</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-900">Status</h4>
              <div className="text-xs space-y-1">
                {storageStatus.errors.length > 0 && (
                  <div className="text-red-600">
                    {storageStatus.errors.length} error(s)
                  </div>
                )}
                {storageStatus.warnings.length > 0 && (
                  <div className="text-yellow-600">
                    {storageStatus.warnings.length} warning(s)
                  </div>
                )}
                {storageStatus.errors.length === 0 && storageStatus.warnings.length === 0 && (
                  <div className="text-green-600">All systems operational</div>
                )}
              </div>
            </div>
          </div>

          {storageStatus.errors.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-red-900 mb-1">Errors:</h5>
              <ul className="text-xs text-red-700 space-y-1">
                {storageStatus.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {storageStatus.warnings.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-yellow-900 mb-1">Warnings:</h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                {storageStatus.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-1">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={generateReport}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Download Full Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageStatusIndicator;
