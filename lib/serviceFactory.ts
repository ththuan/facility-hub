// Service factory để chọn giữa Supabase service thật và mock service
import { Device } from './deviceService';
import { ProcurementItem } from './procurementService';
import { Room } from './roomService';
import { MockDeviceService, MockProcurementService, MockRoomService } from './mockService';

// Kiểm tra xem có sử dụng mock hay không
const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://mock.supabase.co';

console.log('Service Factory - USE_MOCK:', USE_MOCK);
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Device service factory
export const getDeviceService = () => {
  if (USE_MOCK) {
    return MockDeviceService;
  }
  // Import dynamic để tránh lỗi khi build
  const { deviceService } = require('./deviceService');
  return deviceService;
};

// Procurement service factory
export const getProcurementService = () => {
  if (USE_MOCK) {
    return MockProcurementService;
  }
  // Import dynamic để tránh lỗi khi build
  const { ProcurementService } = require('./procurementService');
  return ProcurementService;
};

// Room service factory
export const getRoomService = () => {
  if (USE_MOCK) {
    return MockRoomService;
  }
  // Import dynamic để tránh lỗi khi build
  const { RoomService } = require('./roomService');
  return RoomService;
};

// Export types
export type { Device, ProcurementItem, Room };
