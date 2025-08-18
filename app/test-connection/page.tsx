'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>('Đang kiểm tra...');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    const results: any = {
      timestamp: new Date().toLocaleString('vi-VN'),
      tests: {}
    };

    try {
      // Test 1: Load devices
      console.log('🔍 Testing devices connection...');
      const devices = await supabaseService.getDevices();
      results.tests.devices = {
        success: true,
        count: devices.length,
        sample: devices.slice(0, 2)
      };

      // Test 2: Load rooms  
      console.log('🔍 Testing rooms connection...');
      const rooms = await supabaseService.getRooms();
      results.tests.rooms = {
        success: true,
        count: rooms.length,
        sample: rooms.slice(0, 2)
      };

      // Test 3: Load tasks
      console.log('🔍 Testing tasks connection...');
      const tasks = await supabaseService.getTasks();
      results.tests.tasks = {
        success: true,
        count: tasks.length,
        sample: tasks.slice(0, 2)
      };

      // Test 4: Load work orders
      console.log('🔍 Testing work orders connection...');
      const workOrders = await supabaseService.getWorkOrders();
      results.tests.workOrders = {
        success: true,
        count: workOrders.length,
        sample: workOrders.slice(0, 2)
      };

      // Test 5: Load documents
      console.log('🔍 Testing documents connection...');
      const documents = await supabaseService.getDocuments();
      results.tests.documents = {
        success: true,
        count: documents.length,
        sample: documents.slice(0, 2)
      };

      // Test 6: Load procurement items
      console.log('🔍 Testing procurement connection...');
      const procurement = await supabaseService.getProcurementItems();
      results.tests.procurement = {
        success: true,
        count: procurement.length,
        sample: procurement.slice(0, 2)
      };

      setStatus('✅ Tất cả kết nối thành công!');
      setDetails(results);

    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      setStatus('❌ Có lỗi kết nối cơ sở dữ liệu');
      results.error = error.message;
      setDetails(results);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🔍 Kiểm tra Kết nối Hệ thống
          </h1>

          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Trạng thái:</div>
            <div className={`p-4 rounded-lg ${
              status.includes('✅') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : status.includes('❌')
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {status}
            </div>
          </div>

          {details.tests && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chi tiết kiểm tra:
              </h2>
              
              {Object.entries(details.tests).map(([key, result]: [string, any]) => (
                <div key={key} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                      {key === 'workOrders' ? 'Work Orders' : key}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {result.success ? '✅ OK' : '❌ FAIL'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tổng số: <strong>{result.count}</strong> bản ghi
                  </div>
                  
                  {result.sample && result.sample.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400">
                        Xem mẫu dữ liệu ({result.sample.length} bản ghi)
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.sample, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {details.error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Lỗi:</h3>
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                {details.error}
              </pre>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={testConnections}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Kiểm tra lại
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Lần kiểm tra cuối: {details.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
