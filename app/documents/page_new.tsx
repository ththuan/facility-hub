'use client';

import { useState, useEffect } from "react";
import { supabaseService, Document, Device } from "@/lib/supabaseService";
import { GoogleDriveService, DriveFile, DriveFolder } from "@/lib/googleDriveService";

const getDocTypeText = (type: string) => {
  switch (type) {
    case 'Hợp đồng': return 'Hợp đồng';
    case 'Báo giá': return 'Báo giá';
    case 'Bàn giao': return 'Bàn giao';
    case 'Quy trình': return 'Quy trình';
    case 'Khác': return 'Khác';
    default: return type;
  }
};

const getDocTypeColor = (type: string) => {
  switch (type) {
    case 'Hợp đồng': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Báo giá': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Bàn giao': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Quy trình': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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
  
  // Google Drive states
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveFolder, setDriveFolder] = useState<DriveFolder | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [showDriveFiles, setShowDriveFiles] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "Khác" as Document['type'],
    description: "",
    tags: "",
    deviceId: "",
    filePath: "",
  });

  // Load data from Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      const [allDocuments, allDevices] = await Promise.all([
        supabaseService.getDocuments(),
        supabaseService.getDevices()
      ]);
      console.log('Loaded documents:', allDocuments.length);
      console.log('Loaded devices:', allDevices.length);
      setDocuments(allDocuments);
      setDevices(allDevices);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Google Drive functions
  const checkGoogleDriveConnection = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('google_access_token') || 
                    JSON.parse(localStorage.getItem('google_tokens') || '{}').access_token;
      
      if (!token) {
        setIsGoogleDriveConnected(false);
        return;
      }

      // Test the token with a simple request
      const driveService = new GoogleDriveService();
      await driveService.listFiles(undefined, 1); // Just test with 1 file
      
      setIsGoogleDriveConnected(true);
      console.log('✅ Google Drive connected');
    } catch (error) {
      console.error('Google Drive connection failed:', error);
      setIsGoogleDriveConnected(false);
    }
  };

  const setupDriveFolder = async () => {
    if (!isGoogleDriveConnected) return;

    try {
      setDriveLoading(true);
      const driveService = new GoogleDriveService();
      const folder = await driveService.createFolder('Facility Hub Documents');
      
      setDriveFolder(folder);
      setUploadStatus('✅ Đã tạo thư mục "Facility Hub Documents" trên Google Drive');
      console.log('📁 Created Drive folder:', folder);
    } catch (error) {
      console.error('Error creating Drive folder:', error);
      setUploadStatus('❌ Lỗi tạo thư mục: ' + (error as Error).message);
    } finally {
      setDriveLoading(false);
    }
  };

  const loadDriveFiles = async () => {
    if (!isGoogleDriveConnected) return;

    try {
      setDriveLoading(true);
      const driveService = new GoogleDriveService();
      const files = driveFolder 
        ? await driveService.listFiles(driveFolder.id, 100)
        : await driveService.searchFiles('name contains "Facility Hub"');
      
      setDriveFiles(files);
      console.log('📁 Loaded Drive files:', files.length);
    } catch (error) {
      console.error('Error loading Drive files:', error);
      setUploadStatus('❌ Lỗi tải danh sách file: ' + (error as Error).message);
    } finally {
      setDriveLoading(false);
    }
  };

  const deleteDriveFile = async (fileId: string) => {
    if (!isGoogleDriveConnected || !window.confirm('Bạn có chắc chắn muốn xóa file này khỏi Google Drive?')) return;

    try {
      setDriveLoading(true);
      const driveService = new GoogleDriveService();
      await driveService.deleteFile(fileId);
      
      setUploadStatus('✅ Đã xóa file khỏi Google Drive');
      loadDriveFiles();
    } catch (error) {
      console.error('Error deleting Drive file:', error);
      setUploadStatus('❌ Lỗi xóa file: ' + (error as Error).message);
    } finally {
      setDriveLoading(false);
    }
  };

  const uploadToDriveFromModal = async () => {
    if (!selectedFile || !isGoogleDriveConnected) return;

    try {
      setUploadProgress(10);
      
      const driveService = new GoogleDriveService();
      setUploadProgress(30);
      
      const uploadedFile = await driveService.uploadFile(selectedFile, driveFolder?.id, fileDescription);
      setUploadProgress(90);
      
      setUploadStatus(`✅ Upload thành công: ${uploadedFile.name}`);
      setUploadProgress(100);
      
      // Reset form and close modal
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setFileDescription('');
        setUploadProgress(0);
        loadDriveFiles();
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading from modal:', error);
      setUploadStatus('❌ Lỗi upload: ' + (error as Error).message);
      setUploadProgress(0);
    }
  };

  // Document functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      type: formData.type,
      description: formData.description,
      tags: tagsArray,
      deviceId: formData.deviceId || undefined,
      filePath: formData.filePath,
    };
    
    try {
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
      type: "Khác" as Document['type'],
      description: "",
      tags: "",
      deviceId: "",
      filePath: "",
    });
    setEditingDocument(null);
    setShowAddForm(false);
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? `${device.name} (${device.code})` : 'Thiết bị không tồn tại';
  };

  // Effects
  useEffect(() => {
    loadData();
    checkGoogleDriveConnection();
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
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              ➕ Thêm tài liệu
            </button>
            
            {isGoogleDriveConnected ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDriveFiles(!showDriveFiles)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
                >
                  {showDriveFiles ? '📁 Ẩn Drive' : '☁️ Google Drive'}
                </button>
                <button 
                  onClick={loadDriveFiles}
                  disabled={driveLoading}
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  {driveLoading ? '🔄' : '↻'}
                </button>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  📤 Upload
                </button>
              </div>
            ) : (
              <button 
                onClick={() => window.location.href = '/calendar'}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm sm:text-base"
              >
                🔗 Kết nối Google Drive
              </button>
            )}
          </div>
        </div>

        {/* Google Drive Status */}
        {uploadStatus && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <span className="text-blue-800 dark:text-blue-200 text-sm">{uploadStatus}</span>
            <button 
              onClick={() => setUploadStatus(null)}
              className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Drive Setup */}
        {isGoogleDriveConnected && !driveFolder && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              🎯 Setup Google Drive
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
              Tạo thư mục chuyên dụng trên Google Drive để lưu trữ tài liệu an toàn.
            </p>
            <button
              onClick={setupDriveFolder}
              disabled={driveLoading}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
            >
              {driveLoading ? '🔄 Đang tạo...' : '📁 Tạo thư mục Google Drive'}
            </button>
          </div>
        )}

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
            <option value="Hợp đồng">Hợp đồng</option>
            <option value="Báo giá">Báo giá</option>
            <option value="Bàn giao">Bàn giao</option>
            <option value="Quy trình">Quy trình</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Google Drive Files */}
        {showDriveFiles && isGoogleDriveConnected && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ☁️ Google Drive Files
                </h2>
                {driveFolder && (
                  <a 
                    href={driveFolder.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    📁 Mở thư mục →
                  </a>
                )}
              </div>
            </div>
            
            <div className="p-4">
              {driveLoading ? (
                <div className="text-center py-8">
                  <span className="text-gray-500 dark:text-gray-400">🔄 Đang tải...</span>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-gray-500 dark:text-gray-400">📄 Chưa có file nào trong Google Drive</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {driveFiles.map((file) => {
                    const driveService = new GoogleDriveService();
                    return (
                      <div key={file.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{driveService.getFileIcon(file.mimeType)}</span>
                          <button
                            onClick={() => deleteDriveFile(file.id!)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                          {file.name}
                        </h4>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {driveService.formatFileSize(file.size || '0')} • {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('vi-VN') : ''}
                        </p>
                        
                        {file.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                            {file.description}
                          </p>
                        )}
                        
                        <div className="flex gap-1">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              👁️ Xem
                            </a>
                          )}
                          {file.webContentLink && (
                            <a
                              href={file.webContentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800"
                            >
                              📥 Tải
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-700">
            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Tổng số tài liệu</h3>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{documents.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-700">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Hợp đồng</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {documents.filter(d => d.type === 'Hợp đồng').length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border dark:border-purple-700">
            <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Báo giá</h3>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {documents.filter(d => d.type === 'Báo giá').length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-700">
            <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Quy trình</h3>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {documents.filter(d => d.type === 'Quy trình').length}
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4 mb-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">📄 Không có tài liệu nào</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {searchTerm || typeFilter ? "Thử thay đổi bộ lọc" : "Thêm tài liệu đầu tiên để bắt đầu"}
              </p>
            </div>
          ) : (
            filteredDocuments.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDocTypeColor(doc.type)}`}>
                        {getDocTypeText(doc.type)}
                      </span>
                    </div>
                    
                    {doc.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{doc.description}</p>
                    )}
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {doc.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {doc.deviceId && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        🔧 {getDeviceName(doc.deviceId)}
                      </p>
                    )}
                    
                    {doc.filePath && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        📁 {doc.filePath}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 lg:flex-col lg:items-end">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <span>Tạo: {formatDate(doc.createdAt)}</span>
                  <span>Cập nhật: {formatDate(doc.updatedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Document Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {editingDocument ? "Sửa tài liệu" : "Thêm tài liệu mới"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại tài liệu
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Document['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Khác">Khác</option>
                      <option value="Hợp đồng">Hợp đồng</option>
                      <option value="Báo giá">Báo giá</option>
                      <option value="Bàn giao">Bàn giao</option>
                      <option value="Quy trình">Quy trình</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="ví dụ: hợp đồng, quan trọng, 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Đường dẫn file *
                    </label>
                    <input
                      type="text"
                      value={formData.filePath}
                      onChange={(e) => setFormData(prev => ({ ...prev, filePath: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="/documents/contract-2024.pdf"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thiết bị liên quan
                    </label>
                    <select
                      value={formData.deviceId}
                      onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Không liên quan đến thiết bị</option>
                      {devices.map(device => (
                        <option key={device.id} value={device.id}>{device.name} ({device.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      {editingDocument ? "Cập nhật" : "Thêm mới"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📤 Upload to Google Drive
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setFileDescription('');
                    setUploadProgress(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="Nhập mô tả cho file..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      🔄 Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={uploadToDriveFromModal}
                    disabled={!selectedFile || uploadProgress > 0}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
                  >
                    {uploadProgress > 0 ? '🔄 Uploading...' : '📤 Upload'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                      setFileDescription('');
                      setUploadProgress(0);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
