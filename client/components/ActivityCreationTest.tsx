import React, { useState } from 'react';
import { useActivities } from '../contexts/ActivitiesContext';

export default function ActivityCreationTest() {
  const { addActivity, createActivity } = useActivities();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLegacyAddActivity = async () => {
    setLoading(true);
    setTestResult('Testing legacy addActivity...');
    
    try {
      const result = await addActivity({
        type: "cycling",
        title: "Test Cycling Activity",
        date: "2025-01-20",
        time: "10:00",
        location: "Test Location",
        meetupLocation: "Test Meeting Point",
        organizer: "Test User",
        maxParticipants: "10",
        specialComments: "This is a test activity",
      });

      setTestResult(`Legacy addActivity result: ${result ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      setTestResult(`Legacy addActivity error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testNewCreateActivity = async () => {
    setLoading(true);
    setTestResult('Testing new createActivity...');
    
    try {
      const result = await createActivity({
        title: "Test New Activity",
        activity_type: "running",
        date_time: "2025-01-20T14:00:00.000Z",
        location: "Test Location",
        max_participants: 15,
        difficulty_level: "beginner",
        price_per_person: 0,
      });

      setTestResult(`New createActivity result: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.error || 'No error'}`);
    } catch (error) {
      setTestResult(`New createActivity error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4">
      <h3 className="font-bold text-blue-800 mb-4">Activity Creation Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testLegacyAddActivity}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          Test Legacy addActivity
        </button>
        
        <button
          onClick={testNewCreateActivity}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test New createActivity
        </button>
      </div>

      {testResult && (
        <div className="bg-gray-100 p-2 rounded text-sm">
          <strong>Result:</strong> {testResult}
        </div>
      )}
    </div>
  );
}
