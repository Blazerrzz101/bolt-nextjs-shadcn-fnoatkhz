/**
 * Authentication utilities for protecting the CMS dashboard
 */

// Environment variables for admin credentials
// In production, use secure environment variables from your hosting platform
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tier-dAdmin2024!';

// Simple token generation for admin sessions
export function generateAuthToken() {
  return `tierd-admin-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Verify admin credentials
export function verifyAdminCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// Client-side function to check if user is authenticated
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const authToken = localStorage.getItem('tierd-admin-token');
  const expiry = localStorage.getItem('tierd-admin-expiry');
  
  if (!authToken || !expiry) return false;
  
  // Check if token is expired (24 hour validity)
  if (parseInt(expiry) < Date.now()) {
    localStorage.removeItem('tierd-admin-token');
    localStorage.removeItem('tierd-admin-expiry');
    return false;
  }
  
  return true;
}

// Client-side function to set authentication
export function setAuthentication(token) {
  if (typeof window === 'undefined') return;
  
  // Set token with 24 hour expiry
  localStorage.setItem('tierd-admin-token', token);
  localStorage.setItem('tierd-admin-expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
}

// Client-side function to clear authentication
export function clearAuthentication() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('tierd-admin-token');
  localStorage.removeItem('tierd-admin-expiry');
} 