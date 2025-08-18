'use client';

import { useState, useEffect } from 'react';
import { procurementManager, ProcurementItem, ProcurementBudget } from '@/lib/procurementManager';

export default function ProcurementPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý Mua sắm</h1>
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Trang mua sắm đang được cập nhật</h2>
        <p className="text-gray-600">
          Chúng tôi đang cập nhật tính năng mua sắm để thêm hình ảnh thiết bị và cải thiện giao diện.
          Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
}
