'use client';

import { useState, useEffect } from "react";
import { supabaseService } from "@/lib/supabaseService";

type Room = {
  id: string;
  code: string;
  name: string;
  area?: number;
  capacity?: number;
  type?: string;
  floor?: string;
  building?: string;
  description?: string;
  status: 'Hoạt động' | 'Bảo trì' | 'Tạm dừng';
  createdAt: string;
  updatedAt: string;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getRooms();
      setRooms(data as Room[]);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải phòng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Quản lý Phòng</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          📊 Tổng quan phòng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">Tổng phòng</h3>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{rooms.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Hoạt động</h3>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {rooms.filter(r => r.status === 'Hoạt động').length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Bảo trì</h3>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {rooms.filter(r => r.status === 'Bảo trì').length}
            </p>
          </div>
        </div>
      </div>

      {rooms.length === 0 && !error && (
        <div className="mt-8 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Chưa có dữ liệu phòng
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            Cần chạy setup database để tạo dữ liệu mẫu
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Vào Supabase Dashboard → SQL Editor → Chạy script setup-database.sql
          </p>
        </div>
      )}

      {rooms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Danh sách phòng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{room.name}</h4>
                    <p className="text-sm text-gray-500">Mã: {room.code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.status === 'Hoạt động' ? 'bg-green-100 text-green-800' :
                    room.status === 'Bảo trì' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {room.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {room.type && <p>Loại: {room.type}</p>}
                  {room.area && <p>Diện tích: {room.area} m²</p>}
                  {room.capacity && <p>Sức chứa: {room.capacity} người</p>}
                  {room.floor && <p>Tầng: {room.floor}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
