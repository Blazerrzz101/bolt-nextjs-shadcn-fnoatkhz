import { isBrowser } from './polyfills';

// Simple cookie implementation for fallback
const simpleCookie = {
  get: (name) => {
    if (!isBrowser()) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },
  set: (name, value, options = {}) => {
    if (!isBrowser()) return;
    const optionsString = Object.entries(options).reduce((acc, [key, val]) => {
      if (key === 'expires' && typeof val === 'number') {
        const d = new Date();
        d.setTime(d.getTime() + (val * 24 * 60 * 60 * 1000));
        return `${acc}; expires=${d.toUTCString()}`;
      }
      return `${acc}; ${key}=${val}`;
    }, '');
    document.cookie = `${name}=${value}${optionsString}`;
  },
  remove: (name) => {
    if (!isBrowser()) return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// Use js-cookie if available, otherwise use the simple implementation
let cookies;
try {
  cookies = require('js-cookie');
} catch (error) {
  cookies = simpleCookie;
  console.log('Using fallback cookie implementation');
}

// Generate a random token
export function generateAuthToken() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

// Verify admin credentials
export function verifyAdminCredentials(username, password) {
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'Tier-dAdmin2024!';
  
  return username === validUsername && password === validPassword;
}

// Check if the user is authenticated
export function isAuthenticated() {
  if (!isBrowser()) {
    // Server-side authentication would be different, for our mock we return false
    return false;
  }
  
  // Check for auth token in cookies
  const token = cookies.get('tier_d_auth_token');
  if (!token) return false;
  
  try {
    // In a real app, we would verify the token with the server
    // For our mock app, we'll just check if it exists
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

// Set authentication
export function setAuthentication(token) {
  if (!isBrowser()) return false;
  
  // Save token to cookie, expires in 1 day
  cookies.set('tier_d_auth_token', token, { 
    expires: 1, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  return true;
}

// Clear authentication
export function clearAuthentication() {
  if (!isBrowser()) return false;
  
  // Remove the auth cookie
  cookies.remove('tier_d_auth_token');
  
  return true;
} 