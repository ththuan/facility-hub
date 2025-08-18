'use client';

import { useState, useEffect } from 'react';

interface EmailSettings {
  enabled: boolean;
  smtpServer: string;
  smtpPort: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  notifications: {
    warrantyExpiry: boolean;
    workOrderOverdue: boolean;
    taskReminders: boolean;
    systemAlerts: boolean;
  };
  schedules: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    enabled: false,
    smtpServer: '',
    smtpPort: '587',
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'Facility Hub',
    notifications: {
      warrantyExpiry: true,
      workOrderOverdue: true,
      taskReminders: true,
      systemAlerts: false,
    },
    schedules: {
      daily: false,
      weekly: true,
      monthly: true,
    },
  });

  const [testEmail, setTestEmail] = useState('');
  const [emailHistory, setEmailHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('email-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Load email history
    const history = localStorage.getItem('email-history');
    if (history) {
      setEmailHistory(JSON.parse(history));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('email-settings', JSON.stringify(settings));
    alert('✅ Đã lưu cài đặt email');
  };

  const sendTestEmail = () => {
    if (!testEmail) {
      alert('Vui lòng nhập địa chỉ email test');
      return;
    }

    // Simulate sending test email
    const testRecord = {
      id: Date.now(),
      to: testEmail,
      subject: 'Test Email từ Facility Hub',
      content: 'Đây là email test để kiểm tra cấu hình email notification.',
      status: 'success',
      timestamp: new Date().toISOString(),
      type: 'test'
    };

    const newHistory = [testRecord, ...emailHistory.slice(0, 49)]; // Keep last 50
    setEmailHistory(newHistory);
    localStorage.setItem('email-history', JSON.stringify(newHistory));
    
    alert('📧 Đã gửi email test thành công!');
    setTestEmail('');
  };

  const generateEmailReport = () => {
    // Simulate generating and sending report
    const reportRecord = {
      id: Date.now(),
      to: settings.fromEmail,
      subject: 'Báo cáo hàng tuần - Facility Hub',
      content: 'Báo cáo tổng quan về thiết bị, work orders và tasks trong tuần.',
      status: 'success',
      timestamp: new Date().toISOString(),
      type: 'report'
    };

    const newHistory = [reportRecord, ...emailHistory.slice(0, 49)];
    setEmailHistory(newHistory);
    localStorage.setItem('email-history', JSON.stringify(newHistory));
    
    alert('📊 Đã tạo và gửi báo cáo email!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Email Notifications</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Cấu hình thông báo email tự động cho hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Configuration */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">⚙️ Cấu hình Email</h3>
          
          {/* Enable/Disable */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Bật thông báo email
              </span>
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* SMTP Settings */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    value={settings.smtpServer}
                    onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="email"
                    value={settings.username}
                    onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={settings.password}
                    onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-3">
            <button
              onClick={saveSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              💾 Lưu cài đặt
            </button>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">🔔 Loại thông báo</h3>
          
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {key === 'warrantyExpiry' && '📅 Sắp hết bảo hành'}
                  {key === 'workOrderOverdue' && '⏰ Work Order quá hạn'}
                  {key === 'taskReminders' && '✅ Nhắc nhở Task'}
                  {key === 'systemAlerts' && '🚨 Cảnh báo hệ thống'}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </label>
            ))}
          </div>

          <hr className="my-6 border-gray-200 dark:border-gray-700" />

          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">📅 Lịch báo cáo</h4>
          <div className="space-y-4">
            {Object.entries(settings.schedules).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {key === 'daily' && 'Báo cáo hàng ngày'}
                  {key === 'weekly' && 'Báo cáo hàng tuần'}
                  {key === 'monthly' && 'Báo cáo hàng tháng'}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    schedules: { ...settings.schedules, [key]: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">🧪 Test Email</h3>
        <div className="flex space-x-4">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Nhập email để test"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            onClick={sendTestEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            📧 Gửi Test
          </button>
          <button
            onClick={generateEmailReport}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            📊 Tạo Báo cáo
          </button>
        </div>
      </div>

      {/* Email History */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">📜 Lịch sử Email</h3>
        </div>
        <div className="p-6">
          {emailHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📧</div>
              <p className="text-gray-500 dark:text-gray-400">Chưa có email nào được gửi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailHistory.slice(0, 10).map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        email.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {email.status === 'success' ? '✅' : '❌'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        email.type === 'test' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                      }`}>
                        {email.type === 'test' ? '🧪 Test' : '📊 Report'}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{email.subject}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Đến: {email.to} • {new Date(email.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">💡 Hướng dẫn cấu hình</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">📧 Gmail SMTP:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Server: smtp.gmail.com</li>
              <li>Port: 587 (TLS)</li>
              <li>Cần bật "App Password" trong Gmail</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">📤 Outlook SMTP:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Server: smtp-mail.outlook.com</li>
              <li>Port: 587 (TLS)</li>
              <li>Sử dụng tài khoản Microsoft</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
