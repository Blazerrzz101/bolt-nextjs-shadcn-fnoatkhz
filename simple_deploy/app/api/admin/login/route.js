import '../../../../lib/complete-polyfills';
import { verifyAdminCredentials, generateAuthToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // Validate input
    if (!username || !password) {
      return Response.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Validate credentials
    if (!verifyAdminCredentials(username, password)) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate token for authenticated session
    const token = generateAuthToken();
    
    return Response.json({
      success: true,
      data: {
        token,
        expiresIn: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      }
    });
  } catch (error) {
    console.error('Login API error:', error);
    return Response.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 