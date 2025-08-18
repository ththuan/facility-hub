// API route to handle bulk device import
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabaseService';

interface ImportDeviceRow {
  code: string;
  name: string;
  category: string;
  unit: string;
  purchaseYear?: number;
  warrantyUntil?: string;
  roomCode?: string;
  status: 'good' | 'maintenance' | 'broken' | 'repairing';
  quantity: number;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Bulk device import API called');

    const body = await request.json();
    const { devices, replaceExisting = false } = body;

    if (!Array.isArray(devices) || devices.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'No devices data provided' 
      }, { status: 400 });
    }

    console.log('📁 Processing', devices.length, 'devices');

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      imported: [] as any[],
    };

    // Get existing rooms for roomCode mapping
    const rooms = await supabaseService.getRooms();
    const roomMap = new Map(rooms.map(r => [r.code.toLowerCase(), r.id]));

    // Get existing devices if replaceExisting is false
    let existingDevices: any[] = [];
    if (!replaceExisting) {
      existingDevices = await supabaseService.getDevices();
    }
    const existingCodes = new Set(existingDevices.map((d: any) => d.code.toLowerCase()));

    for (let index = 0; index < devices.length; index++) {
      const deviceData = devices[index];
      try {
        const rowNumber = index + 1;

        // Validate required fields
        if (!deviceData.code || !deviceData.name || !deviceData.category || !deviceData.unit) {
          results.failed++;
          results.errors.push(`Dòng ${rowNumber}: Thiếu thông tin bắt buộc (mã, tên, danh mục, đơn vị)`);
          continue;
        }

        // Check for duplicate codes if not replacing
        if (!replaceExisting && existingCodes.has(deviceData.code.toLowerCase())) {
          results.failed++;
          results.errors.push(`Dòng ${rowNumber}: Mã thiết bị "${deviceData.code}" đã tồn tại`);
          continue;
        }

        // Map roomCode to roomId
        let roomId = undefined;
        if (deviceData.roomCode) {
          roomId = roomMap.get(deviceData.roomCode.toLowerCase());
          if (!roomId) {
            results.failed++;
            results.errors.push(`Dòng ${rowNumber}: Không tìm thấy phòng với mã "${deviceData.roomCode}"`);
            continue;
          }
        }

        // Validate status
        const validStatuses = ['good', 'maintenance', 'broken', 'repairing'] as const;
        let status: 'good' | 'maintenance' | 'broken' | 'repairing' = 'good';
        if (deviceData.status) {
          const normalizedStatus = deviceData.status.toLowerCase();
          if (validStatuses.includes(normalizedStatus as any)) {
            status = normalizedStatus as any;
          } else {
            // Try to map Vietnamese status to English
            switch (normalizedStatus) {
              case 'tốt':
                status = 'good';
                break;
              case 'cần bảo trì':
              case 'bảo trì':
                status = 'maintenance';
                break;
              case 'hỏng':
                status = 'broken';
                break;
              case 'đang sửa chữa':
              case 'sửa chữa':
                status = 'repairing';
                break;
              default:
                results.failed++;
                results.errors.push(`Dòng ${rowNumber}: Trạng thái không hợp lệ "${deviceData.status}"`);
                continue;
            }
          }
        }

        // Validate warranty date format
        let warrantyUntil = undefined;
        if (deviceData.warrantyUntil) {
          const warrantyDate = new Date(deviceData.warrantyUntil);
          if (isNaN(warrantyDate.getTime())) {
            results.failed++;
            results.errors.push(`Dòng ${rowNumber}: Định dạng ngày bảo hành không hợp lệ "${deviceData.warrantyUntil}"`);
            continue;
          }
          warrantyUntil = deviceData.warrantyUntil;
        }

        // Validate purchase year
        let purchaseYear = undefined;
        if (deviceData.purchaseYear) {
          const year = parseInt(deviceData.purchaseYear.toString());
          if (isNaN(year) || year < 1990 || year > 2030) {
            results.failed++;
            results.errors.push(`Dòng ${rowNumber}: Năm mua không hợp lệ "${deviceData.purchaseYear}"`);
            continue;
          }
          purchaseYear = year;
        }

        // Validate quantity
        let quantity = 1;
        if (deviceData.quantity) {
          const qty = parseInt(deviceData.quantity.toString());
          if (isNaN(qty) || qty < 1) {
            results.failed++;
            results.errors.push(`Dòng ${rowNumber}: Số lượng không hợp lệ "${deviceData.quantity}"`);
            continue;
          }
          quantity = qty;
        }

        // Create device object
        const newDevice = {
          code: deviceData.code.trim(),
          name: deviceData.name.trim(),
          category: deviceData.category.trim(),
          unit: deviceData.unit.trim(),
          image: deviceData.image?.trim() || undefined,
          purchaseYear,
          warrantyUntil,
          roomId,
          status,
          quantity,
          meta: {},
        };

        // Create device
        const createdDevice = await supabaseService.createDevice(newDevice);
        if (createdDevice) {
          results.success++;
          results.imported.push({
            row: rowNumber,
            code: newDevice.code,
            name: newDevice.name,
            id: createdDevice.id,
          });

          console.log(`✅ Row ${rowNumber}: Created device ${newDevice.code}`);
        } else {
          results.failed++;
          results.errors.push(`Dòng ${rowNumber}: Không thể tạo thiết bị ${newDevice.code}`);
        }

      } catch (error) {
        results.failed++;
        results.errors.push(`Dòng ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`❌ Row ${index + 1} error:`, error);
      }
    }

    console.log('📊 Import results:', results);

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error) {
    console.error('❌ Import API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Import failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Device bulk import endpoint',
    supportedFormats: ['CSV', 'Excel'],
    requiredFields: ['code', 'name', 'category', 'unit'],
    optionalFields: ['purchaseYear', 'warrantyUntil', 'roomCode', 'status', 'quantity', 'image'],
    statusValues: ['good', 'maintenance', 'broken', 'repairing', 'tốt', 'cần bảo trì', 'hỏng', 'đang sửa chữa'],
  });
}
