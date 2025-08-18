'use client';

import { useState, useEffect } from 'react';
import { GoogleCalendarService } from '@/lib/googleCalendarService';

export default function DebugCalendar() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = () => {
    const directToken = localStorage.getItem('google_access_token');
    const tokensObj = localStorage.getItem('google_tokens');
    const refreshToken = localStorage.getItem('google_refresh_token');
    
    let parsedTokens = null;
    try {
      if (tokensObj) {
        parsedTokens = JSON.parse(tokensObj);
      }
    } catch (e) {
      console.error('Error parsing tokens:', e);
    }

    setDebugInfo({
      hasDirectToken: !!directToken,
      hasTokensObj: !!tokensObj,
      hasRefreshToken: !!refreshToken,
      directToken: directToken ? directToken.substring(0, 50) + '...' : null,
      parsedTokens: parsedTokens,
      allLocalStorageKeys: Object.keys(localStorage).filter(k => k.includes('google'))
    });
  };

  const testCalendarAPI = async () => {
    setLoading(true);
    try {
      console.log('=== Testing Google Calendar API ===');
      const service = new GoogleCalendarService();
      
      console.log('Calling getEvents...');
      const eventList = await service.getEvents('primary');
      console.log('Events received:', eventList);
      
      setEvents(eventList);
    } catch (error) {
      console.error('Calendar API Error:', error);
      setDebugInfo((prev: any) => ({
        ...prev,
        apiError: error instanceof Error ? error.message : String(error)
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    const keysToRemove = Object.keys(localStorage).filter(k => k.includes('google'));
    keysToRemove.forEach(key => localStorage.removeItem(key));
    loadDebugInfo();
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          🔍 Debug Google Calendar
        </h1>

        <div className="space-y-6">
          {/* Debug Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Token Information
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Actions
            </h2>
            <div className="space-x-4">
              <button
                onClick={testCalendarAPI}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Calendar API'}
              </button>
              
              <button
                onClick={loadDebugInfo}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Refresh Debug Info
              </button>
              
              <button
                onClick={clearStorage}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Storage
              </button>
            </div>
          </div>

          {/* Events */}
          {events.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Events ({events.length})
              </h2>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(events, null, 2)}
              </pre>
            </div>
          )}

          {/* Environment Variables */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Environment Variables
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}
              </div>
              <div>
                <strong>NEXT_PUBLIC_GOOGLE_REDIRECT_URI:</strong> {process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
