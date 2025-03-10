import { verifyAdminCredentials, generateAuthToken } from '../../../lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return Response.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Verify credentials
    const isValid = verifyAdminCredentials(username, password);
    
    if (!isValid) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate token
    const token = generateAuthToken();
    
    return Response.json({
      success: true,
      data: {
        token,
        user: {
          username,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    console.error('Auth API error:', error);
    return Response.json(
      { success: false, error: error.message || 'An error occurred during authentication' },
      { status: 500 }
    );
  }
} 