'use client';

import { useState, useEffect } from 'react';
import { GoogleAuthService } from '@/lib/googleAuthService';

export default function GoogleAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);
  
  const authService = GoogleAuthService.getInstance();

  useEffect(() => {
    const info = {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
      currentUrl: window.location.href,
      isAuthenticated: authService.isAuthenticated(),
      storedTokens: localStorage.getItem('google_tokens'),
      authUrl: authService.getAuthUrl()
    };
    setDebugInfo(info);

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const tokensParam = urlParams.get('tokens');
    const errorParam = urlParams.get('error');

    addLog(`URL Params - auth: ${authStatus}, tokens: ${tokensParam ? 'present' : 'null'}, error: ${errorParam}`);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleLogin = () => {
    addLog('Starting Google OAuth login...');
    addLog(`Redirecting to: ${authService.getAuthUrl()}`);
    window.location.href = authService.getAuthUrl();
  };

  const handleLogout = () => {
    addLog('Logging out...');
    authService.clearTokens();
    localStorage.removeItem('google_tokens');
    window.location.reload();
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Google Auth Debug</h1>

      {/* Environment Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="font-semibold">Client ID:</span> 
            <span className={debugInfo.clientId ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.clientId || 'NOT SET'}
            </span>
          </div>
          <div>
            <span className="font-semibold">Redirect URI:</span> 
            <span className={debugInfo.redirectUri ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.redirectUri || 'NOT SET'}
            </span>
          </div>
          <div>
            <span className="font-semibold">Current URL:</span> 
            <span className="text-blue-600">{debugInfo.currentUrl}</span>
          </div>
          <div>
            <span className="font-semibold">Is Authenticated:</span> 
            <span className={debugInfo.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {debugInfo.isAuthenticated ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>

      {/* Stored Tokens */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stored Tokens</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
          {debugInfo.storedTokens || 'No tokens stored'}
        </pre>
      </div>

      {/* Auth URL */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Generated Auth URL</h2>
        <div className="bg-gray-100 p-4 rounded text-xs break-all">
          {debugInfo.authUrl}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-x-4">
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            🔑 Test Google Login
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            🚪 Logout
          </button>
          <button
            onClick={() => window.location.href = '/calendar'}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            📅 Go to Calendar
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Debug Logs</h2>
          <button
            onClick={clearLogs}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Debug Steps</h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>Check if Client ID and Redirect URI are properly set</li>
          <li>Click "Test Google Login" to start OAuth flow</li>
          <li>Check browser console for any JavaScript errors</li>
          <li>After OAuth redirect, check if tokens are stored</li>
          <li>If tokens exist but authentication fails, check token validity</li>
        </ol>
      </div>
    </div>
  );
}
