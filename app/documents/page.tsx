'use client';

import { useState, useEffect } from "react";
import { supabaseService, Document, Device } from "@/lib/supabaseService";

const getDocTypeText = (type: string) => {
  switch (type) {
    case 'contract': return 'Hợp đồng';
    case 'quote': return 'Báo giá';
    case 'handover': return 'Bàn giao';
    case 'procedure': return 'Quy trình';
    case 'other': return 'Khác';
    default: return type;
  }
};

const getDocTypeColor = (type: string) => {
  switch (type) {
    case 'contract': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'quote': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'handover': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'procedure': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDevice, setSelectedDevice] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "other" as Document['type'],
    description: "",
    tags: "",
    deviceId: "",
    filePath: "",
  });

  // Load data
  const loadData = async () => {
    try {
      const [documentsData, devicesData] = await Promise.all([
        supabaseService.getDocuments(),
        supabaseService.getDevices(),
      ]);
      
      setDocuments(documentsData);
      setDevices(devicesData);
      
      console.log('✅ Loaded documents:', documentsData.length);
      console.log('✅ Loaded devices:', devicesData.length);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Lỗi khi tải dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert tags from string to array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const documentData = {
        ...formData,
        tags: tagsArray,
      };
      
      if (isEditing && editingDocument) {
        // Update existing document
        await supabaseService.updateDocument(editingDocument.id!, documentData);
        console.log('Document updated successfully');
      } else {
        // Create new document
        await supabaseService.createDocument(documentData);
        console.log('Document created successfully');
      }
      
      // Reset form
      setFormData({
        title: "",
        type: "other",
        description: "",
        tags: "",
        deviceId: "",
        filePath: "",
      });
      setShowForm(false);
      setIsEditing(false);
      setEditingDocument(null);
      
      // Reload data
      await loadData();
      
      alert(isEditing ? 'Cập nhật tài liệu thành công!' : 'Thêm tài liệu thành công!');
      
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Lỗi khi lưu tài liệu. Vui lòng thử lại!');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    
    try {
      await supabaseService.deleteDocument(id);
      await loadData();
      alert('Xóa tài liệu thành công!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Lỗi khi xóa tài liệu!');
    }
  };

  // Handle edit
  const handleEdit = (doc: Document) => {
    setFormData({
      title: doc.title,
      type: doc.type,
      description: doc.description || "",
      tags: doc.tags ? doc.tags.join(', ') : "",
      deviceId: doc.deviceId || "",
      filePath: doc.filePath || "",
    });
    setEditingDocument(doc);
    setIsEditing(true);
    setShowForm(true);
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || doc.type === selectedType;
    const matchesDevice = selectedDevice === "all" || doc.deviceId === selectedDevice;
    
    return matchesSearch && matchesType && matchesDevice;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Tài liệu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý tài liệu hệ thống ({documents.length} tài liệu)
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setEditingDocument(null);
            setFormData({
              title: "",
              type: "other",
              description: "",
              tags: "",
              deviceId: "",
              filePath: "",
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          + Thêm tài liệu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, mô tả, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Loại tài liệu
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="contract">Hợp đồng</option>
              <option value="quote">Báo giá</option>
              <option value="handover">Bàn giao</option>
              <option value="procedure">Quy trình</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Device filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thiết bị
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tất cả thiết bị</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {filteredDocuments.length} / {documents.length} tài liệu
        </div>
      </div>

      {/* Document Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {isEditing ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên tài liệu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập tên tài liệu"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại tài liệu *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Document['type']})}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="other">Khác</option>
                    <option value="contract">Hợp đồng</option>
                    <option value="quote">Báo giá</option>
                    <option value="handover">Bàn giao</option>
                    <option value="procedure">Quy trình</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Thiết bị liên quan
                  </label>
                  <select
                    value={formData.deviceId}
                    onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Không liên quan</option>
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Đường dẫn file
                </label>
                <input
                  type="text"
                  value={formData.filePath}
                  onChange={(e) => setFormData({...formData, filePath: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập đường dẫn hoặc URL của file"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg h-24 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Nhập mô tả chi tiết về tài liệu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="ví dụ: bảo trì, máy chiếu"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setEditingDocument(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                {doc.title}
              </h3>
              <div className="flex space-x-2 ml-2">
                <button
                  onClick={() => handleEdit(doc)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:bg-blue-900/20"
                  title="Chỉnh sửa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(doc.id!)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                  title="Xóa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full ${getDocTypeColor(doc.type)}`}>
                  {getDocTypeText(doc.type)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(doc.createdAt)}
                </span>
              </div>

              {doc.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {doc.description}
                </p>
              )}

              {doc.deviceId && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  🔗 {devices.find(d => d.id === doc.deviceId)?.name || 'Thiết bị không xác định'}
                </div>
              )}

              {doc.tags && doc.tags.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  🏷️ {doc.tags.join(', ')}
                </div>
              )}

              {doc.filePath && (
                <div className="mt-2">
                  <a
                    href={doc.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Mở file
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {searchTerm || selectedType !== "all" || selectedDevice !== "all" 
            ? "Không tìm thấy tài liệu nào phù hợp với bộ lọc" 
            : "Chưa có tài liệu nào. Hãy thêm tài liệu đầu tiên!"
          }
        </div>
      )}
    </div>
  );
}
