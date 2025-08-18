// Debug Google Calendar Authentication
// Add this to browser console to debug

console.log('=== Google Calendar Debug ===');
console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
console.log('Redirect URI:', process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI);

// Check localStorage for existing tokens
console.log('Stored tokens:', localStorage.getItem('google_tokens'));

// Check if auth service is working
import { GoogleAuthService } from './lib/googleAuthService';
const authService = GoogleAuthService.getInstance();
console.log('Auth URL:', authService.getAuthUrl());
console.log('Is authenticated:', authService.isAuthenticated());
