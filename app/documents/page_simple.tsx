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
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    type: "other" as Document['type'],
    description: "",
    tags: "",
    deviceId: "",
    filePath: "",
  });
  
  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate file path based on file name
      const fileName = file.name;
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `/documents/${Date.now()}_${sanitizedName}`;
      setFormData(prev => ({ ...prev, filePath }));
    }
  };

  // Simulate file upload (in real app, upload to server/storage)
  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, upload to Supabase Storage or your file server
    // For demo, just return a mock path
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const mockPath = `/documents/${Date.now()}_${fileName}`;
    
    setUploading(false);
    return mockPath;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let filePath = formData.filePath;
      
      // If there's a selected file, "upload" it first
      if (selectedFile) {
        filePath = await uploadFile(selectedFile);
      }
      
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        tags: tagsArray,
        deviceId: formData.deviceId || undefined,
        filePath: filePath,
      };
      
      if (editingDocument) {
        await supabaseService.updateDocument(editingDocument.id, docData);
        console.log('Document updated successfully');
      } else {
        const newDoc = await supabaseService.createDocument(docData);
        console.log('Document created:', newDoc);
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Lỗi khi lưu tài liệu. Vui lòng thử lại!');
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      type: document.type,
      description: document.description || '',
      tags: document.tags.join(', '),
      deviceId: document.deviceId || '',
      filePath: document.filePath,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        const result = await supabaseService.deleteDocument(id);
        if (result) {
          console.log('Document deleted successfully');
          await loadData();
        } else {
          alert('Không thể xóa tài liệu này. Vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Lỗi khi xóa tài liệu. Vui lòng thử lại!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "other" as Document['type'],
      description: "",
      tags: "",
      deviceId: "",
      filePath: "",
    });
    setEditingDocument(null);
    setShowAddForm(false);
    setSelectedFile(null);
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? `${device.name} (${device.code})` : 'Thiết bị không tồn tại';
  };

  const getFileExtension = (filePath: string) => {
    return filePath.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (filePath: string) => {
    const ext = getFileExtension(filePath);
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📎';
    }
  };

  // View document modal
  const DocumentViewModal = () => {
    if (!viewingDocument) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {getFileIcon(viewingDocument.filePath)} {viewingDocument.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {viewingDocument.description}
              </p>
            </div>
            <button 
              onClick={() => setViewingDocument(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thông tin cơ bản
                </label>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Loại:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getDocTypeColor(viewingDocument.type)}`}>
                      {getDocTypeText(viewingDocument.type)}
                    </span>
                  </p>
                  <p><span className="font-medium">Ngày tạo:</span> {formatDate(viewingDocument.createdAt)}</p>
                  <p><span className="font-medium">Cập nhật:</span> {formatDate(viewingDocument.updatedAt)}</p>
                  {viewingDocument.deviceId && (
                    <p><span className="font-medium">Thiết bị:</span> {getDeviceName(viewingDocument.deviceId)}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {viewingDocument.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t dark:border-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File
              </label>
              <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(viewingDocument.filePath)}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {viewingDocument.filePath.split('/').pop()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getFileExtension(viewingDocument.filePath).toUpperCase()} file
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(viewingDocument.filePath, '_blank')}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    📖 Xem
                  </button>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = viewingDocument.filePath;
                      link.download = viewingDocument.filePath.split('/').pop() || 'document';
                      link.click();
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    💾 Tải về
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-medium">Lưu ý:</span> Đây là demo. File thực tế sẽ được lưu trữ an toàn trên server hoặc cloud storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesType = typeFilter === "" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📄 Quản lý Tài liệu</h1>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Thêm tài liệu
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="contract">Hợp đồng</option>
            <option value="quote">Báo giá</option>
            <option value="handover">Bàn giao</option>
            <option value="procedure">Quy trình</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getFileIcon(document.filePath)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 break-words">
                      {document.title}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDocTypeColor(document.type)}`}>
                      {getDocTypeText(document.type)}
                    </span>
                  </div>
                </div>
              </div>
              
              {document.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}
              
              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {document.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {document.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{document.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              {document.deviceId && (
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
                  🔧 {getDeviceName(document.deviceId)}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>{formatDate(document.createdAt)}</span>
                <span>{getFileExtension(document.filePath).toUpperCase()}</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewingDocument(document)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  👁️ Xem
                </button>
                <button 
                  onClick={() => handleEdit(document)}
                  className="bg-yellow-500 text-white px-3 py-2 rounded text-xs hover:bg-yellow-600 transition-colors"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(document.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-xs hover:bg-red-600 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có tài liệu</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {documents.length === 0 ? 'Thêm tài liệu đầu tiên của bạn' : 'Không tìm thấy tài liệu phù hợp'}
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              ➕ Thêm tài liệu
            </button>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingDocument ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loại tài liệu
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Document['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="other">Khác</option>
                    <option value="contract">Hợp đồng</option>
                    <option value="quote">Báo giá</option>
                    <option value="handover">Bàn giao</option>
                    <option value="procedure">Quy trình</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="báo giá, bảo trì, máy chiếu"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thiết bị liên quan
                  </label>
                  <select
                    value={formData.deviceId}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn thiết bị --</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                {!editingDocument && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload File
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        ✓ Đã chọn: {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}
                
                {editingDocument && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Đường dẫn file *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.filePath}
                      onChange={(e) => setFormData(prev => ({ ...prev, filePath: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? '🔄 Đang xử lý...' : editingDocument ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document View Modal */}
        <DocumentViewModal />
      </div>
    </div>
  );
}
