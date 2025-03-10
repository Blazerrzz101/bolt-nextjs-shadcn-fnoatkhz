import { getCategories } from '../../../lib/data-utils';

export async function GET(request) {
  try {
    const categories = getCategories();
    
    return Response.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return Response.json(
      { success: false, error: error.message || 'An error occurred fetching categories' },
      { status: 500 }
    );
  }
} 