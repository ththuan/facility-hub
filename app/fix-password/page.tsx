'use client'

import { useState } from 'react';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';

export default function FixPasswordPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');

  const handleFixPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setResult('Please enter both username and password');
      return;
    }

    try {
      const result = await SupabaseAuthService.fixUserPassword(username, password);
      setResult(result.message);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const handleTestLogin = async () => {
    if (!username || !password) {
      setResult('Please enter both username and password');
      return;
    }

    try {
      const result = await SupabaseAuthService.login(username, password);
      setResult(`Login test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
    } catch (error) {
      setResult(`Login test error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Fix User Password</h1>
        
        <form onSubmit={handleFixPassword} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter new password"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Fix Password
          </button>

          <button 
            type="button"
            onClick={handleTestLogin}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Login
          </button>
        </form>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Quick fixes:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>For admin: username=admin, password=admin123</li>
            <li>For new users: use the password you set when creating them</li>
            <li>This will re-hash passwords with correct bcryptjs format</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
