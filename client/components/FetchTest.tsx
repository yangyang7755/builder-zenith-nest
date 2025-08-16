import React, { useState, useEffect } from 'react';
import { robustFetch } from '../utils/robustFetch';

export const FetchTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    method: string;
    status: 'success' | 'error';
    message: string;
    responseTime?: number;
  }>>([]);

  const runFetchTests = async () => {
    setTestResults([]);
    const results: typeof testResults = [];

    // Test 1: Health endpoint with robust fetch
    try {
      const startTime = Date.now();
      const response = await robustFetch('/api/health');
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      results.push({
        method: 'Robust Fetch (/api/health)',
        status: 'success',
        message: `Status: ${data.status}, Mode: ${data.mode}`,
        responseTime
      });
    } catch (error) {
      results.push({
        method: 'Robust Fetch (/api/health)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Try with regular fetch (might fail with FullStory)
    try {
      const startTime = Date.now();
      const response = await window.fetch('/api/health');
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      results.push({
        method: 'Window Fetch (/api/health)',
        status: 'success',
        message: `Status: ${data.status}, Mode: ${data.mode}`,
        responseTime
      });
    } catch (error) {
      results.push({
        method: 'Window Fetch (/api/health)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Test followers endpoint
    try {
      const startTime = Date.now();
      const response = await robustFetch('/api/followers/demo-user-123');
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      results.push({
        method: 'Robust Fetch (/api/followers)',
        status: 'success',
        message: `Found ${data.length} followers`,
        responseTime
      });
    } catch (error) {
      results.push({
        method: 'Robust Fetch (/api/followers)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
  };

  useEffect(() => {
    runFetchTests();
  }, []);

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Fetch Implementation Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Testing robust fetch implementation against FullStory interference
      </p>
      
      <button
        onClick={runFetchTests}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Tests Again
      </button>

      <div className="space-y-3">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded border-l-4 ${
              result.status === 'success'
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm">{result.method}</h4>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    result.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.status}
                </span>
                {result.responseTime && (
                  <div className="text-xs text-gray-500 mt-1">
                    {result.responseTime}ms
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {testResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Running tests...
        </div>
      )}
    </div>
  );
};

export default FetchTest;
