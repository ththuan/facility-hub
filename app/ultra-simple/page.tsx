'use client';

import { useState } from 'react';

export default function UltraSimpleTest() {
  const [result, setResult] = useState('');

  const testLogin = async () => {
    setResult('Testing login...\n');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: 'admin', 
          password: 'admin123' 
        })
      });
      
      const data = await response.json();
      setResult(prev => prev + `Result: ${JSON.stringify(data, null, 2)}\n`);
      
    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    }
  };

  const testUserLogin = async () => {
    setResult('Testing user login...\n');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: 'tranthuan', 
          password: 'tranthuan123' 
        })
      });
      
      const data = await response.json();
      setResult(prev => prev + `Result: ${JSON.stringify(data, null, 2)}\n`);
      
    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Ultra Simple Test</h1>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Admin Login
        </button>
        
        <button 
          onClick={testUserLogin}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test User Login
        </button>
      </div>
      
      <pre className="bg-gray-100 p-4 rounded">
        {result || 'Click buttons to test...'}
      </pre>
    </div>
  );
}
