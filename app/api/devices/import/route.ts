import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { devices } = body;

    // Mock response for build time
    return NextResponse.json({
      success: true,
      results: {
        success: devices?.length || 0,
        failed: 0,
        errors: [],
        imported: [],
      },
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Import failed'
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
  });
}
