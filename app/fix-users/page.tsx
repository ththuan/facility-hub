'use client'

import { useState } from 'react';
import { supabaseAdmin } from '../api/_supabaseAdmin';
import bcrypt from 'bcryptjs';

export default function FixUsersPage() {
  const [result, setResult] = useState<string>('');
  const [testUsername, setTestUsername] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const fixUsers = async () => {
    try {
      // Lấy tất cả users
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*');

      if (usersError) {
        setResult(`Error fetching users: ${usersError.message}`);
        return;
      }

      setResult(`Found ${users?.length || 0} users:\n` + 
                users?.map((u: any) => `- ${u.username}: status=${u.status}, role_id=${u.role_id}, created=${u.created_at}`).join('\n'));

      // Fix users không có status active
      const usersToFix = users?.filter((u: any) => u.status !== 'active') || [];
      
      if (usersToFix.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ status: 'active' })
          .in('id', usersToFix.map((u: any) => u.id));

        if (updateError) {
          setResult(prev => prev + `\n\nError updating users: ${updateError.message}`);
        } else {
          setResult(prev => prev + `\n\nFixed ${usersToFix.length} users to active status`);
        }
      } else {
        setResult(prev => prev + `\n\nAll users already have active status`);
      }

    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      if (!testUsername || !testPassword) {
        setResult('Please enter username and password');
        return;
      }

      // Test login logic
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select(`
          id,
          username,
          email,
          password_hash,
          status,
          role_id
        `)
        .eq('username', testUsername)
        .eq('status', 'active')
        .single();

      if (userError) {
        setResult(`User lookup error: ${userError.message}`);
        return;
      }

      if (!user) {
        setResult('User not found or not active');
        return;
      }

      // Test password
      const passwordMatch = bcrypt.compareSync(testPassword, user.password_hash);
      
      setResult(`User found: ${user.username}\n` +
                `Email: ${user.email}\n` +
                `Status: ${user.status}\n` +
                `Role ID: ${user.role_id}\n` +
                `Password Match: ${passwordMatch ? 'YES' : 'NO'}\n` +
                `Hash: ${user.password_hash}`);

      if (passwordMatch) {
        // Get role info
        const { data: role, error: roleError } = await supabaseAdmin
          .from('roles')
          .select(`
            name,
            permissions:role_permissions(
              permission:permissions(name, description)
            )
          `)
          .eq('id', user.role_id)
          .single();

        if (role) {
          setResult(prev => prev + `\n\nRole: ${role.name}\n` +
                    `Permissions: ${role.permissions?.map((p: any) => p.permission?.name).join(', ') || 'None'}`);
        }
      }

    } catch (error) {
      setResult(`Test login error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Fix Users & Test Login</h1>
        <p className="text-gray-600 mb-6">Fix user status và test login functionality</p>
        
        <div className="space-y-4">
          <button 
            onClick={fixUsers}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Fix All Users Status
          </button>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">Test Username</label>
            <input
              id="username"
              type="text"
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              placeholder="Enter username to test"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Test Password</label>
            <input
              id="password"
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Enter password to test"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <button 
            onClick={testLogin}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Login
          </button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
