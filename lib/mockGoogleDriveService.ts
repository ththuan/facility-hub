// Simple Google Drive-style file storage service (Mock for now)
export class MockGoogleDriveService {
  private static instance: MockGoogleDriveService;

  private constructor() {}

  public static getInstance(): MockGoogleDriveService {
    if (!MockGoogleDriveService.instance) {
      MockGoogleDriveService.instance = new MockGoogleDriveService();
    }
    return MockGoogleDriveService.instance;
  }

  // Upload file via API route (mock Google Drive)
  async uploadFile(file: File): Promise<{
    id: string;
    name: string;
    webViewLink: string;
    webContentLink: string;
    directLink: string;
    thumbnailLink: string;
    uploadedAt: string;
  }> {
    try {
      console.log('📤 Uploading to Mock Google Drive:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('✅ Mock Google Drive upload successful:', result);
      return result;

    } catch (error) {
      console.error('❌ Google Drive upload error:', error);
      throw new Error(`Google Drive upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete file (mock)
  async deleteFile(fileId: string): Promise<void> {
    try {
      console.log('🗑️ Mock deleting file from Google Drive:', fileId);
      
      // In real implementation, this would call Google Drive API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Mock file deleted successfully');
    } catch (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }
  }

  // Get file info (mock)
  async getFileInfo(fileId: string): Promise<any> {
    try {
      console.log('ℹ️ Getting file info from Google Drive:', fileId);
      
      // Mock file info
      return {
        id: fileId,
        name: `File_${fileId}`,
        mimeType: 'application/octet-stream',
        size: '1024000',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
        webContentLink: `https://drive.google.com/uc?id=${fileId}`,
      };
    } catch (error) {
      console.error('❌ Get file info error:', error);
      throw error;
    }
  }

  // Check if we can connect to Google Drive (mock)
  async checkConnection(): Promise<boolean> {
    try {
      console.log('🔍 Checking Google Drive connection...');
      
      // Simulate connection check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Google Drive connection OK (mock)');
      return true;
    } catch (error) {
      console.error('❌ Google Drive connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mockGoogleDriveService = MockGoogleDriveService.getInstance();
