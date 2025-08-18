'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';

export default function DebugPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading debug data from Supabase...');
      
      const [docsData, devicesData, roomsData, workOrdersData] = await Promise.all([
        supabaseService.getDocuments(),
        supabaseService.getDevices(), 
        supabaseService.getRooms(),
        supabaseService.getWorkOrders()
      ]);
      
      console.log('📄 Documents:', docsData);
      console.log('🔧 Devices:', devicesData);
      console.log('🏠 Rooms:', roomsData);
      console.log('📋 Work Orders:', workOrdersData);
      
      setDocuments(docsData);
      setDevices(devicesData);
      setRooms(roomsData);
      setWorkOrders(workOrdersData);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabaseService.supabase
        .from('documents')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      
      alert(`✅ Connection successful! Found ${data || 0} documents`);
    } catch (err) {
      alert(`❌ Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading debug data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Supabase Debug Console
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Database connection and data status
        </p>
        <button
          onClick={testConnection}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Test Connection
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={loadData}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📄 Documents ({documents.length} items)
          </h2>
          {documents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No documents found</p>
          ) : (
            <div className="overflow-x-auto">
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(documents, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            🔧 Devices ({devices.length} items)
          </h2>
          {devices.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No devices found</p>
          ) : (
            <div className="overflow-x-auto">
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(devices, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Rooms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            🏠 Rooms ({rooms.length} items)
          </h2>
          {rooms.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No rooms found</p>
          ) : (
            <div className="overflow-x-auto">
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(rooms, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Work Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📋 Work Orders ({workOrders.length} items)
          </h2>
          {workOrders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No work orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(workOrders, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Database Schema Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            🗄️ Database Schema Status
          </h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Expected Tables:</span> documents, devices, rooms, work_orders</p>
            <p><span className="font-medium">Documents loaded:</span> {documents.length > 0 ? '✅' : '❌'}</p>
            <p><span className="font-medium">Devices loaded:</span> {devices.length > 0 ? '✅' : '❌'}</p>
            <p><span className="font-medium">Rooms loaded:</span> {rooms.length > 0 ? '✅' : '❌'}</p>
            <p><span className="font-medium">Work Orders loaded:</span> {workOrders.length > 0 ? '✅' : '❌'}</p>
            
            {documents.length === 0 && devices.length === 0 && rooms.length === 0 && workOrders.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ No data found. Run the setup-database.sql script in Supabase Dashboard → SQL Editor
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
