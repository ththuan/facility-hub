// API route to upload file to Google Drive
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Google Drive upload API called');

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📁 File received:', { name: file.name, size: file.size, type: file.type });

    // For now, we'll use a simple approach - just return a mock response
    // In production, you'd need to implement Google Drive API integration
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response - in production, replace with actual Google Drive API call
    const mockResponse = {
      id: `gdrive_${Date.now()}`,
      name: file.name,
      webViewLink: `https://drive.google.com/file/d/mock_${Date.now()}/view`,
      webContentLink: `https://drive.google.com/uc?id=mock_${Date.now()}`,
      directLink: `https://drive.google.com/uc?export=download&id=mock_${Date.now()}`,
      thumbnailLink: `https://drive.google.com/thumbnail?id=mock_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };

    console.log('✅ Mock upload successful:', mockResponse);

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Google Drive upload endpoint' });
}
