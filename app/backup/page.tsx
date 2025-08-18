'use client';

import { useState, useEffect } from 'react';

interface BackupSettings {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeImages: boolean;
  includeDocuments: boolean;
  backupLocation: 'local' | 'cloud';
  notifyOnBackup: boolean;
  lastBackup?: string;
}

interface BackupFile {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'auto' | 'manual';
  status: 'success' | 'failed' | 'in_progress';
  location: string;
}

export default function BackupSettingsPage() {
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    frequency: 'weekly',
    retentionDays: 30,
    includeImages: true,
    includeDocuments: true,
    backupLocation: 'local',
    notifyOnBackup: true
  });

  const [backupHistory, setBackupHistory] = useState<BackupFile[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  useEffect(() => {
    loadSettings();
    loadBackupHistory();
    setupAutoBackup();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('backup-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: BackupSettings) => {
    setSettings(newSettings);
    localStorage.setItem('backup-settings', JSON.stringify(newSettings));
    setupAutoBackup();
  };

  const loadBackupHistory = () => {
    const history = localStorage.getItem('backup-history');
    if (history) {
      setBackupHistory(JSON.parse(history));
    } else {
      // Tạo lịch sử backup mẫu
      const sampleHistory: BackupFile[] = [
        {
          id: '1',
          name: 'backup_2024_01_15.zip',
          date: '2024-01-15T10:30:00Z',
          size: '2.5 MB',
          type: 'auto',
          status: 'success',
          location: 'Ổ đĩa cục bộ'
        },
        {
          id: '2',
          name: 'backup_2024_01_08.zip',
          date: '2024-01-08T10:30:00Z',
          size: '2.3 MB',
          type: 'auto',
          status: 'success',
          location: 'Ổ đĩa cục bộ'
        },
        {
          id: '3',
          name: 'backup_manual_2024_01_05.zip',
          date: '2024-01-05T14:22:00Z',
          size: '2.7 MB',
          type: 'manual',
          status: 'success',
          location: 'Ổ đĩa cục bộ'
        }
      ];
      setBackupHistory(sampleHistory);
      localStorage.setItem('backup-history', JSON.stringify(sampleHistory));
    }
  };

  const setupAutoBackup = () => {
    // Thiết lập auto backup (trong thực tế sẽ sử dụng cron job hoặc service worker)
    if (settings.autoBackup) {
      console.log(`Auto backup thiết lập: ${settings.frequency}`);
      // Có thể sử dụng setInterval cho demo
      // setInterval(createAutoBackup, getIntervalFromFrequency(settings.frequency));
    }
  };

  const getIntervalFromFrequency = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 24 * 60 * 60 * 1000; // 1 ngày
      case 'weekly': return 7 * 24 * 60 * 60 * 1000; // 1 tuần
      case 'monthly': return 30 * 24 * 60 * 60 * 1000; // 1 tháng
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // Simulate backup progress
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newBackup: BackupFile = {
        id: Date.now().toString(),
        name: `backup_manual_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.zip`,
        date: new Date().toISOString(),
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        type: 'manual',
        status: 'success',
        location: settings.backupLocation === 'local' ? 'Ổ đĩa cục bộ' : 'Cloud Storage'
      };

      const updatedHistory = [newBackup, ...backupHistory];
      setBackupHistory(updatedHistory);
      localStorage.setItem('backup-history', JSON.stringify(updatedHistory));

      // Update last backup time
      const updatedSettings = { ...settings, lastBackup: new Date().toISOString() };
      saveSettings(updatedSettings);

      alert('✅ Backup thành công!');
    } catch (error) {
      alert('❌ Backup thất bại!');
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục từ backup này? Dữ liệu hiện tại sẽ bị ghi đè.')) {
      return;
    }

    const backup = backupHistory.find(b => b.id === backupId);
    if (!backup) return;

    try {
      // Simulate restore process
      alert(`🔄 Đang khôi phục từ ${backup.name}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✅ Khôi phục thành công!');
    } catch (error) {
      alert('❌ Khôi phục thất bại!');
    }
  };

  const deleteBackup = (backupId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa backup này?')) {
      return;
    }

    const updatedHistory = backupHistory.filter(b => b.id !== backupId);
    setBackupHistory(updatedHistory);
    localStorage.setItem('backup-history', JSON.stringify(updatedHistory));
    alert('✅ Đã xóa backup');
  };

  const downloadBackup = (backup: BackupFile) => {
    // Simulate download
    const element = document.createElement('a');
    element.href = '#';
    element.download = backup.name;
    element.click();
    alert(`📥 Đang tải xuống ${backup.name}`);
  };

  const cleanupOldBackups = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);

    const filteredHistory = backupHistory.filter(backup => 
      new Date(backup.date) > cutoffDate
    );

    if (filteredHistory.length < backupHistory.length) {
      setBackupHistory(filteredHistory);
      localStorage.setItem('backup-history', JSON.stringify(filteredHistory));
      alert(`🗑️ Đã xóa ${backupHistory.length - filteredHistory.length} backup cũ`);
    } else {
      alert('ℹ️ Không có backup cũ nào cần xóa');
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify({
      settings,
      backupHistory,
      exportDate: new Date().toISOString()
    }, null, 2);
    
    const element = document.createElement('a');
    element.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr);
    element.download = `backup_settings_${new Date().toISOString().split('T')[0]}.json`;
    element.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Auto Backup</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cấu hình sao lưu tự động và quản lý backup
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportSettings}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            📤 Xuất cấu hình
          </button>
          <button
            onClick={createManualBackup}
            disabled={isCreatingBackup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {isCreatingBackup ? `🔄 ${backupProgress}%` : '💾 Backup ngay'}
          </button>
        </div>
      </div>

      {/* Backup Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Backup cuối</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {settings.lastBackup 
                  ? new Date(settings.lastBackup).toLocaleDateString('vi-VN')
                  : 'Chưa có'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <span className="text-2xl">📁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng backup</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{backupHistory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tần suất</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {settings.frequency === 'daily' ? 'Hàng ngày' : 
                 settings.frequency === 'weekly' ? 'Hàng tuần' : 'Hàng tháng'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${settings.autoBackup ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
              <span className="text-2xl">{settings.autoBackup ? '🟢' : '🔴'}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trạng thái</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {settings.autoBackup ? 'Đang hoạt động' : 'Tạm dừng'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Cài đặt Backup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto Backup</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tự động sao lưu dữ liệu</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => saveSettings({ ...settings, autoBackup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tần suất backup
              </label>
              <select
                value={settings.frequency}
                onChange={(e) => saveSettings({ ...settings, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lưu trữ backup (ngày)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.retentionDays}
                onChange={(e) => saveSettings({ ...settings, retentionDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Backup cũ hơn {settings.retentionDays} ngày sẽ được xóa tự động
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vị trí lưu trữ
              </label>
              <select
                value={settings.backupLocation}
                onChange={(e) => saveSettings({ ...settings, backupLocation: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="local">Ổ đĩa cục bộ</option>
                <option value="cloud">Cloud Storage</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nội dung backup
              </label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeImages"
                  checked={settings.includeImages}
                  onChange={(e) => saveSettings({ ...settings, includeImages: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeImages" className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                  Bao gồm hình ảnh
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeDocuments"
                  checked={settings.includeDocuments}
                  onChange={(e) => saveSettings({ ...settings, includeDocuments: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeDocuments" className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                  Bao gồm tài liệu
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyOnBackup"
                  checked={settings.notifyOnBackup}
                  onChange={(e) => saveSettings({ ...settings, notifyOnBackup: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyOnBackup" className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                  Thông báo khi backup
                </label>
              </div>
            </div>

            <button
              onClick={cleanupOldBackups}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
            >
              🗑️ Dọn dẹp backup cũ
            </button>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Lịch sử Backup</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Tổng cộng: {backupHistory.length} backup
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tên file
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kích thước
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {backupHistory.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {backup.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(backup.date).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      backup.type === 'auto' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                        : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    }`}>
                      {backup.type === 'auto' ? '🤖 Tự động' : '👤 Thủ công'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      backup.status === 'success' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : backup.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {backup.status === 'success' ? '✅ Thành công' : 
                       backup.status === 'failed' ? '❌ Thất bại' : '🔄 Đang xử lý'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => downloadBackup(backup)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      📥 Tải
                    </button>
                    <button
                      onClick={() => restoreBackup(backup.id)}
                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                    >
                      🔄 Khôi phục
                    </button>
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
