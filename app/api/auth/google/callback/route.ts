import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/googleAuthService';

export async function GET(request: NextRequest) {
  console.log('=== Google OAuth Callback ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    console.log('Callback params:', { code: !!code, error, state });
    console.log('Full URL:', request.url);
    console.log('All search params:', Array.from(searchParams.entries()));

    if (error) {
      console.error('OAuth error:', error);
      const redirectPage = state === 'documents' ? '/documents' : '/calendar';
      return NextResponse.redirect(new URL(`${redirectPage}?error=` + error, request.url));
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(new URL('/calendar?error=no_code', request.url));
    }

    console.log('Exchanging code for tokens...');
    const authService = GoogleAuthService.getInstance();
    const tokens = await authService.exchangeCodeForTokens(code);
    
    console.log('Tokens received:', { 
      access_token: !!tokens.access_token,
      refresh_token: !!tokens.refresh_token,
      expires_in: tokens.expires_in 
    });

    // Redirect based on state parameter
    const redirectPage = state === 'documents' ? '/documents' : '/calendar';
    const redirectUrl = new URL(redirectPage, request.url);
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('tokens', encodeURIComponent(JSON.stringify(tokens)));

    console.log('Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google auth callback error:', error);
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const redirectPage = state === 'documents' ? '/documents' : '/calendar';
    return NextResponse.redirect(new URL(`${redirectPage}?error=auth_failed&details=` + encodeURIComponent(String(error)), request.url));
  }
}
