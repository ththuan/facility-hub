'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LocalAuthTestPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const testLocalLogin = async () => {
    setMessage('Testing login...');
    
    // Hardcoded test accounts
    const accounts = {
      'admin': { password: 'admin123', role: 'admin', fullName: 'Administrator' },
      'manager': { password: 'manager123', role: 'manager', fullName: 'Manager User' },
      'staff': { password: 'staff123', role: 'staff', fullName: 'Staff User' }
    };

    const account = accounts[username as keyof typeof accounts];
    
    if (account && account.password === password) {
      // Create local session
      const userSession = {
        id: Date.now().toString(),
        username: username,
        email: `${username}@facility-hub.com`,
        full_name: account.fullName,
        role: { 
          name: account.role, 
          display_name: account.role === 'admin' ? 'Quản trị viên' : 
                        account.role === 'manager' ? 'Quản lý' : 'Nhân viên',
          level: account.role === 'admin' ? 1 : account.role === 'manager' ? 2 : 3
        },
        department: 'IT',
        status: 'active',
        loginTime: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('facility_hub_user', JSON.stringify(userSession));
      localStorage.setItem('facility_hub_token', 'local_token_' + Date.now());
      
      setMessage('✅ Login successful! Redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } else {
      setMessage('❌ Invalid credentials! Try: admin/admin123, manager/manager123, staff/staff123');
    }
  };

  const clearLocalAuth = () => {
    localStorage.removeItem('facility_hub_user');
    localStorage.removeItem('facility_hub_token');
    setMessage('Local auth cleared');
  };

  const checkCurrentAuth = () => {
    const user = localStorage.getItem('facility_hub_user');
    const token = localStorage.getItem('facility_hub_token');
    
    if (user && token) {
      setMessage(`Current user: ${JSON.parse(user).username} - Token: ${token.substring(0, 20)}...`);
    } else {
      setMessage('No local authentication found');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8 text-red-600">
          🚨 Emergency Local Auth
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin123"
            />
          </div>

          <button
            onClick={testLocalLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Local Login
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={checkCurrentAuth}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Check Auth
            </button>
            
            <button
              onClick={clearLocalAuth}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Clear Auth
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Accounts:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>admin</strong> / admin123 (Quản trị viên)</p>
            <p><strong>manager</strong> / manager123 (Quản lý)</p>
            <p><strong>staff</strong> / staff123 (Nhân viên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
