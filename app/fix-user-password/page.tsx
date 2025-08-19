'use client';

import { useState } from 'react';

export default function FixUserPasswordPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const fixUserPassword = async () => {
    setLoading(true);
    setResult(`Fixing password for user: ${username}\n`);
    
    try {
      if (!username || !password) {
        setResult(prev => prev + 'Please enter both username and password\n');
        return;
      }

      // Generate correct hash
      const bcrypt = await import('bcryptjs');
      const correctHash = bcrypt.hashSync(password, 10);
      
      setResult(prev => prev + `Step 1: Generated hash for '${password}': ${correctHash}\n`);
      
      // Update user in database
      const { supabaseBrowser } = await import('@/lib/supabaseClient');
      const client = supabaseBrowser();
      
      const { data: updatedUser, error } = await client
        .from('users')
        .update({ password_hash: correctHash })
        .eq('username', username)
        .select('id, username, full_name')
        .single();
        
      if (error) {
        setResult(prev => prev + `Step 2: Update failed: ${error.message}\n`);
        return;
      }
      
      if (!updatedUser) {
        setResult(prev => prev + `Step 2: User '${username}' not found\n`);
        return;
      }
      
      setResult(prev => prev + `Step 2: ✅ Password updated for user: ${updatedUser.username} (${updatedUser.full_name})\n`);
      
      // Test the fix
      setResult(prev => prev + `Step 3: Testing login with new hash...\n`);
      
      const { SupabaseAuthService } = await import('@/lib/supabaseAuthService');
      const loginResult = await SupabaseAuthService.login(username, password);
      
      if (loginResult.success) {
        setResult(prev => prev + `Step 4: ✅ LOGIN SUCCESS! User can now login with ${username}/${password}\n`);
      } else {
        setResult(prev => prev + `Step 4: ❌ Login still failed: ${loginResult.message}\n`);
      }
      
    } catch (error) {
      setResult(prev => prev + `Exception: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const listUsersWithBadHashes = async () => {
    setLoading(true);
    setResult('Checking all users for password hash issues...\n');
    
    try {
      const { supabaseBrowser } = await import('@/lib/supabaseClient');
      const client = supabaseBrowser();
      
      const { data: users, error } = await client
        .from('users')
        .select('id, username, email, full_name, password_hash')
        .order('username');
        
      if (error) {
        setResult(prev => prev + `Error: ${error.message}\n`);
        return;
      }
      
      const bcrypt = await import('bcryptjs');
      setResult(prev => prev + `Found ${users?.length || 0} users. Checking hashes...\n\n`);
      
      for (const user of users || []) {
        setResult(prev => prev + `${user.username} - ${user.full_name}\n`);
        setResult(prev => prev + `  Hash: ${user.password_hash}\n`);
        
        // Check hash format
        if (user.password_hash?.startsWith('$2b$10$')) {
          setResult(prev => prev + `  ✅ Hash format looks correct\n`);
        } else {
          setResult(prev => prev + `  ❌ Hash format looks wrong\n`);
        }
        
        // Test common passwords
        const testPasswords = ['123456', 'admin123', 'manager123', 'staff123', user.username + '123'];
        let passwordFound = false;
        
        for (const testPwd of testPasswords) {
          try {
            if (bcrypt.compareSync(testPwd, user.password_hash)) {
              setResult(prev => prev + `  🔑 Password might be: ${testPwd}\n`);
              passwordFound = true;
              break;
            }
          } catch (e) {
            // Hash might be corrupted
          }
        }
        
        if (!passwordFound) {
          setResult(prev => prev + `  ❓ Password unknown, might need manual fix\n`);
        }
        
        setResult(prev => prev + '\n');
      }
      
    } catch (error) {
      setResult(prev => prev + `Exception: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    setResult('Creating a test user with known password...\n');
    
    try {
      const testUsername = 'testuser_' + Date.now();
      const testPassword = 'test123';
      
      setResult(prev => prev + `Creating user: ${testUsername} with password: ${testPassword}\n`);
      
      const { SupabaseAuthService } = await import('@/lib/supabaseAuthService');
      
      // Get admin role
      const roles = await SupabaseAuthService.getAllRoles();
      const staffRole = roles.find(r => r.name === 'staff') || roles[0];
      
      if (!staffRole) {
        setResult(prev => prev + 'No roles available!\n');
        return;
      }
      
      const createResult = await SupabaseAuthService.createUser({
        username: testUsername,
        email: `${testUsername}@test.com`,
        full_name: 'Test User',
        password: testPassword,
        role_id: staffRole.id,
        department: 'Testing',
        phone: '0123456789',
        position: 'Tester'
      });
      
      setResult(prev => prev + `Create result: ${JSON.stringify(createResult, null, 2)}\n`);
      
      if (createResult.success) {
        setResult(prev => prev + 'Testing login immediately...\n');
        
        const loginResult = await SupabaseAuthService.login(testUsername, testPassword);
        setResult(prev => prev + `Login result: ${JSON.stringify(loginResult, null, 2)}\n`);
        
        if (loginResult.success) {
          setResult(prev => prev + `✅ SUCCESS! New user creation and login working!\n`);
          setResult(prev => prev + `You can login with: ${testUsername} / ${testPassword}\n`);
        } else {
          setResult(prev => prev + `❌ User created but login failed: ${loginResult.message}\n`);
        }
      }
      
    } catch (error) {
      setResult(prev => prev + `Exception: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">🔧 Fix User Password Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username to Fix</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username that can't login"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter what password should be"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={fixUserPassword}
            disabled={loading}
            className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Fixing...' : 'Fix User Password'}
          </button>
          
          <button
            onClick={listUsersWithBadHashes}
            disabled={loading}
            className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check All Users'}
          </button>
          
          <button
            onClick={createTestUser}
            disabled={loading}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Test User'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Fix Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm whitespace-pre-wrap font-mono">
            {result || 'Enter username and password, then click Fix User Password to resolve login issues...'}
          </pre>
        </div>
        
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800">How to use:</h3>
          <ol className="list-decimal list-inside text-red-700 mt-2 space-y-1">
            <li>Enter the username that can't login and what the password should be</li>
            <li>Click "Fix User Password" to update the hash in database</li>
            <li>Or click "Create Test User" to make a new user that definitely works</li>
            <li>Or click "Check All Users" to see hash status of all users</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
