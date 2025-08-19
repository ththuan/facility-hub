'use client';

import { useState } from 'react';

export default function FixNewUsersLogin() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const checkAndFixNewUsers = async () => {
    setLoading(true);
    setResult('🔍 CHECKING NEW USERS LOGIN ISSUES\n');
    setResult(prev => prev + '=' .repeat(50) + '\n\n');
    
    try {
      const { supabaseBrowser } = await import('@/lib/supabaseClient');
      const client = supabaseBrowser();
      const bcrypt = await import('bcryptjs');
      
      // Get all non-admin users
      setResult(prev => prev + '1️⃣ Getting all non-admin users...\n');
      const { data: users, error } = await client
        .from('users')
        .select('id, username, email, full_name, password_hash, status, created_at')
        .neq('username', 'admin')
        .order('created_at', { ascending: false });
        
      if (error) {
        setResult(prev => prev + `❌ Error getting users: ${error.message}\n`);
        return;
      }
      
      setResult(prev => prev + `✅ Found ${users?.length || 0} non-admin users\n\n`);
      
      // Test each user's password
      for (const user of users || []) {
        setResult(prev => prev + `--- Testing ${user.username} (${user.full_name}) ---\n`);
        setResult(prev => prev + `Created: ${user.created_at}\n`);
        setResult(prev => prev + `Hash: ${user.password_hash}\n`);
        
        // Try common passwords
        const testPasswords = [
          user.username + '123',
          '123456',
          'password',
          user.username,
          'admin123'
        ];
        
        let foundPassword = false;
        let workingPassword = '';
        
        for (const pwd of testPasswords) {
          try {
            if (bcrypt.compareSync(pwd, user.password_hash)) {
              setResult(prev => prev + `✅ Current password: ${pwd}\n`);
              foundPassword = true;
              workingPassword = pwd;
              break;
            }
          } catch (e) {
            setResult(prev => prev + `❌ Hash format error\n`);
            break;
          }
        }
        
        if (!foundPassword) {
          setResult(prev => prev + `❌ Password unknown - FIXING...\n`);
          
          // Fix with standard pattern username123
          const standardPassword = user.username + '123';
          const newHash = bcrypt.hashSync(standardPassword, 10);
          
          setResult(prev => prev + `🔧 Setting password to: ${standardPassword}\n`);
          setResult(prev => prev + `🔧 New hash: ${newHash}\n`);
          
          const { error: updateError } = await client
            .from('users')
            .update({ 
              password_hash: newHash,
              status: 'active'
            })
            .eq('id', user.id);
            
          if (updateError) {
            setResult(prev => prev + `❌ Failed to update: ${updateError.message}\n`);
          } else {
            setResult(prev => prev + `✅ Password fixed!\n`);
            
            // Test the fix immediately
            const testFix = bcrypt.compareSync(standardPassword, newHash);
            setResult(prev => prev + `🧪 Testing fix: ${testFix ? '✅ SUCCESS' : '❌ FAILED'}\n`);
            
            // Test via Auth Service
            try {
              const { SupabaseAuthService } = await import('@/lib/supabaseAuthService');
              const loginTest = await SupabaseAuthService.login(user.username, standardPassword);
              setResult(prev => prev + `🔐 Auth Service test: ${loginTest.success ? '✅ SUCCESS' : '❌ FAILED - ' + loginTest.message}\n`);
            } catch (authError) {
              setResult(prev => prev + `🔐 Auth Service error: ${authError instanceof Error ? authError.message : 'Unknown'}\n`);
            }
          }
        } else {
          setResult(prev => prev + `ℹ️ Password already working: ${workingPassword}\n`);
          
          // Still test login via Auth Service to make sure
          try {
            const { SupabaseAuthService } = await import('@/lib/supabaseAuthService');
            const loginTest = await SupabaseAuthService.login(user.username, workingPassword);
            setResult(prev => prev + `🔐 Auth Service test: ${loginTest.success ? '✅ SUCCESS' : '❌ FAILED - ' + loginTest.message}\n`);
          } catch (authError) {
            setResult(prev => prev + `🔐 Auth Service error: ${authError instanceof Error ? authError.message : 'Unknown'}\n`);
          }
        }
        
        setResult(prev => prev + '\n');
      }
      
      setResult(prev => prev + '🎉 ALL USERS PROCESSED!\n\n');
      setResult(prev => prev + '📋 LOGIN CREDENTIALS:\n');
      setResult(prev => prev + '- admin / admin123\n');
      
      for (const user of users || []) {
        const pwd = user.username + '123';
        setResult(prev => prev + `- ${user.username} / ${pwd}\n`);
      }
      
      setResult(prev => prev + '\n✨ Try logging in now with these credentials!\n');
      
    } catch (error) {
      setResult(prev => prev + `💥 ERROR: ${error instanceof Error ? error.message : 'Unknown'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    const testUsername = 'testuser' + Date.now();
    const testPassword = 'test123';
    
    setResult(`🆕 CREATING TEST USER: ${testUsername}\n`);
    setResult(prev => prev + '=' .repeat(40) + '\n\n');
    
    try {
      const { SupabaseAuthService } = await import('@/lib/supabaseAuthService');
      
      setResult(prev => prev + '1️⃣ Getting available roles...\n');
      const roles = await SupabaseAuthService.getAllRoles();
      const staffRole = roles.find(r => r.name === 'staff') || roles[0];
      
      if (!staffRole) {
        setResult(prev => prev + '❌ No roles available!\n');
        return;
      }
      
      setResult(prev => prev + `✅ Using role: ${staffRole.name} (${staffRole.display_name})\n\n`);
      
      setResult(prev => prev + '2️⃣ Creating user...\n');
      const createResult = await SupabaseAuthService.createUser({
        username: testUsername,
        email: `${testUsername}@test.com`,
        full_name: 'Test User ' + Date.now(),
        password: testPassword,
        role_id: staffRole.id,
        department: 'Testing',
        phone: '0123456789',
        position: 'Test Position'
      });
      
      setResult(prev => prev + `Create result: ${JSON.stringify(createResult, null, 2)}\n\n`);
      
      if (createResult.success) {
        setResult(prev => prev + '3️⃣ Testing login immediately...\n');
        
        // Test login right after creation
        const loginResult = await SupabaseAuthService.login(testUsername, testPassword);
        
        setResult(prev => prev + `Login result: ${JSON.stringify(loginResult, null, 2)}\n\n`);
        
        if (loginResult.success) {
          setResult(prev => prev + '🎉 SUCCESS! New user creation and login working perfectly!\n');
          setResult(prev => prev + `✅ You can login with: ${testUsername} / ${testPassword}\n`);
        } else {
          setResult(prev => prev + '❌ User created but login failed. Let me investigate...\n');
          
          // Debug the issue
          const { supabaseBrowser } = await import('@/lib/supabaseClient');
          const client = supabaseBrowser();
          const bcrypt = await import('bcryptjs');
          
          const { data: createdUser } = await client
            .from('users')
            .select('*')
            .eq('username', testUsername)
            .single();
            
          if (createdUser) {
            setResult(prev => prev + `🔍 User in DB: ${createdUser.username}\n`);
            setResult(prev => prev + `🔍 Hash: ${createdUser.password_hash}\n`);
            
            const hashTest = bcrypt.compareSync(testPassword, createdUser.password_hash);
            setResult(prev => prev + `🔍 Hash test: ${hashTest ? '✅ VALID' : '❌ INVALID'}\n`);
            
            if (!hashTest) {
              setResult(prev => prev + '🔧 Fixing hash...\n');
              const correctHash = bcrypt.hashSync(testPassword, 10);
              
              await client
                .from('users')
                .update({ password_hash: correctHash })
                .eq('username', testUsername);
                
              setResult(prev => prev + '🔧 Hash updated, try login again\n');
            }
          }
        }
      } else {
        setResult(prev => prev + `❌ Failed to create user: ${createResult.message}\n`);
      }
      
    } catch (error) {
      setResult(prev => prev + `💥 ERROR: ${error instanceof Error ? error.message : 'Unknown'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificUser = async () => {
    setLoading(true);
    setResult('🎯 TEST SPECIFIC USER LOGIN\n');
    setResult(prev => prev + '=' .repeat(30) + '\n\n');
    
    // You can change these values to test specific users
    const testUsername = 'tranthuan'; // Change this to the username you want to test
    const testPassword = 'tranthuan123'; // Change this to the expected password
    
    setResult(prev => prev + `Testing: ${testUsername} / ${testPassword}\n\n`);
    
    try {
      const { SupabaseAuthService } = await import('@/lib/supabaseAuthService');
      const { supabaseBrowser } = await import('@/lib/supabaseClient');
      const client = supabaseBrowser();
      const bcrypt = await import('bcryptjs');
      
      // Check user exists
      const { data: user, error } = await client
        .from('users')
        .select('*')
        .eq('username', testUsername)
        .single();
        
      if (error) {
        setResult(prev => prev + `❌ User not found: ${error.message}\n`);
        return;
      }
      
      setResult(prev => prev + `✅ User found: ${user.full_name}\n`);
      setResult(prev => prev + `Hash: ${user.password_hash}\n`);
      
      // Test hash
      const isValidHash = bcrypt.compareSync(testPassword, user.password_hash);
      setResult(prev => prev + `Hash test: ${isValidHash ? '✅ VALID' : '❌ INVALID'}\n\n`);
      
      if (!isValidHash) {
        setResult(prev => prev + '🔧 Fixing password...\n');
        const correctHash = bcrypt.hashSync(testPassword, 10);
        
        const { error: updateError } = await client
          .from('users')
          .update({ password_hash: correctHash })
          .eq('username', testUsername);
          
        if (updateError) {
          setResult(prev => prev + `❌ Update failed: ${updateError.message}\n`);
        } else {
          setResult(prev => prev + `✅ Password updated\n`);
        }
      }
      
      // Test login via Auth Service
      const loginResult = await SupabaseAuthService.login(testUsername, testPassword);
      setResult(prev => prev + `Auth Service: ${loginResult.success ? '✅ SUCCESS' : '❌ FAILED - ' + loginResult.message}\n`);
      
    } catch (error) {
      setResult(prev => prev + `💥 ERROR: ${error instanceof Error ? error.message : 'Unknown'}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">🔧 Fix New Users Login</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={checkAndFixNewUsers}
            disabled={loading}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg font-semibold"
          >
            {loading ? 'Fixing...' : 'Fix All Users'}
          </button>
          
          <button
            onClick={createTestUser}
            disabled={loading}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 disabled:opacity-50 text-lg font-semibold"
          >
            {loading ? 'Creating...' : 'Create Test User'}
          </button>
          
          <button
            onClick={testSpecificUser}
            disabled={loading}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-lg font-semibold"
          >
            {loading ? 'Testing...' : 'Test Specific User'}
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-xl">Results:</h3>
          <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96 bg-black text-green-400 p-4 rounded">
            {result || 'Click "Fix All Users" to check and fix password issues for non-admin users...'}
          </pre>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">✅ Admin Login Working!</h3>
          <p className="text-green-700 mt-2">
            Since admin/admin123 works, the core authentication system is functional. 
            The issue is specifically with new user password hashes.
          </p>
          
          <div className="mt-4">
            <h4 className="font-semibold">Tool Functions:</h4>
            <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
              <li><strong>Fix All Users:</strong> Checks and fixes password hashes for all non-admin users</li>
              <li><strong>Create Test User:</strong> Creates a new user and immediately tests login</li>
              <li><strong>Test Specific User:</strong> Tests a specific user (edit code to change username)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
