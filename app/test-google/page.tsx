'use client';

import { useState } from 'react';

export default function TestGoogle() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testToken = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('google_access_token');
      
      if (!token) {
        setResult('❌ No access token found in localStorage');
        return;
      }

      setResult('✅ Token found: ' + token.substring(0, 30) + '...\n\nTesting Google API...');

      // Test userinfo endpoint first (simpler)
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        setResult(prev => prev + '\n\n✅ User Info API works:\n' + JSON.stringify(userInfo, null, 2));
      } else {
        const errorText = await userInfoResponse.text();
        setResult(prev => prev + '\n\n❌ User Info API failed: ' + userInfoResponse.status + ' - ' + errorText);
        return;
      }

      // Test calendar API
      setResult(prev => prev + '\n\nTesting Calendar API...');
      
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&singleEvents=true&orderBy=startTime&timeMin=' + new Date().toISOString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json();
        setResult(prev => prev + '\n\n✅ Calendar API works!\nEvents found: ' + (calendarData.items ? calendarData.items.length : 0) + '\n\n' + JSON.stringify(calendarData, null, 2));
      } else {
        const errorText = await calendarResponse.text();
        setResult(prev => prev + '\n\n❌ Calendar API failed: ' + calendarResponse.status + ' - ' + errorText);
      }

    } catch (error) {
      setResult(prev => prev + '\n\n❌ Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Google API</h1>
      
      <button 
        onClick={testToken}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test Google API'}
      </button>

      <button 
        onClick={() => window.open('/calendar', '_self')}
        className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        ← Back to Calendar
      </button>

      {result && (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mt-4 overflow-x-auto text-sm whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
